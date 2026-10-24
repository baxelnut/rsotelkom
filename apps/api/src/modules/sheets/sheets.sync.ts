import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { throwIfError } from "../../lib/db";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";
import { readTab } from "./sheets.client";
import {
  ORDER_COLUMNS,
  ORDERS_HEADER_ROW,
  PO_HEADER_ROW,
  PO_REQUIRED_HEADERS,
} from "./sheets.columns";
import {
  coerce,
  missingHeaders,
  toRecords,
  toText,
  type SheetRecord,
} from "./sheets.parse";

export type Dataset = "orders" | "po";

interface JobResult {
  rows: number;
  deleted: number;
  skipped: number;
}

export interface SyncOutcome extends Partial<JobResult> {
  dataset: Dataset;
  ok: boolean;
  durationMs: number;
  error?: string;
}

const CHUNK = 500;
const STALE_RUN_MS = 5 * 60_000;

async function writeChunks(
  table: string,
  rows: Record<string, unknown>[],
  onConflict?: string,
) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = onConflict
      ? await supabaseAdmin.from(table).upsert(slice, { onConflict })
      : await supabaseAdmin.from(table).insert(slice);
    throwIfError(error, `${table} write`);
  }
}

async function deleteStale(table: string, syncId: string) {
  const { count, error } = await supabaseAdmin
    .from(table)
    .delete({ count: "exact" })
    .neq("sync_id", syncId);
  throwIfError(error, `${table} cleanup`);
  return count ?? 0;
}

async function syncOrders(force: boolean): Promise<JobResult> {
  const { headers, rows } = await readTab(
    env.ORDERS_SHEET_NAME,
    ORDERS_HEADER_ROW,
  );

  const missing = missingHeaders(headers, Object.keys(ORDER_COLUMNS));
  if (missing.length) {
    throw new AppError(
      422,
      `Orders sheet is missing headers: ${missing.join(", ")}`,
      "HEADERS_MISSING",
    );
  }

  const records = toRecords(headers, rows, ORDERS_HEADER_ROW + 1);
  if (records.length === 0) {
    throw new AppError(422, "Orders sheet has no data rows", "SHEET_EMPTY");
  }

  const syncId = randomUUID();
  const syncedAt = new Date().toISOString();
  const byUuid = new Map<string, Record<string, unknown>>();
  let skipped = 0;

  for (const rec of records) {
    const uuid = toText(rec.values.UUID);
    if (!uuid) {
      skipped++;
      continue;
    }
    const row: Record<string, unknown> = {
      sheet_row: rec.sheetRow,
      sync_id: syncId,
      synced_at: syncedAt,
    };
    for (const [header, kind] of Object.entries(ORDER_COLUMNS)) {
      row[header.toLowerCase()] = coerce(kind, rec.values[header]);
    }
    if (byUuid.has(uuid)) skipped++;
    byUuid.set(uuid, row);
  }

  const { count: existing, error } = await supabaseAdmin
    .from("orders")
    .select("uuid", { count: "exact", head: true });
  throwIfError(error, "orders count");

  if (!force && existing && byUuid.size < existing * 0.5) {
    throw new AppError(
      422,
      `Sheet has ${byUuid.size} rows but the database has ${existing}. Run with force=true if this is intended.`,
      "SUSPICIOUS_SHRINK",
    );
  }

  await writeChunks("orders", [...byUuid.values()], "uuid");
  const deleted = await deleteStale("orders", syncId);
  return { rows: byUuid.size, deleted, skipped };
}

async function syncPo(): Promise<JobResult> {
  const { headers, rows } = await readTab(env.PO_SHEET_NAME, PO_HEADER_ROW);

  const missing = missingHeaders(headers, PO_REQUIRED_HEADERS);
  if (missing.length) {
    throw new AppError(
      422,
      `PO sheet is missing headers: ${missing.join(", ")}`,
      "HEADERS_MISSING",
    );
  }

  const records: SheetRecord[] = toRecords(headers, rows, PO_HEADER_ROW + 1);
  if (records.length === 0) {
    throw new AppError(422, "PO sheet has no data rows", "SHEET_EMPTY");
  }

  const syncId = randomUUID();
  const syncedAt = new Date().toISOString();
  const payload = records.map((rec) => {
    const data: Record<string, string> = {};
    for (const [header, value] of Object.entries(rec.values)) {
      data[header] = toText(value) ?? "";
    }
    return {
      po_name: toText(rec.values.PO_NAME),
      data,
      sync_id: syncId,
      synced_at: syncedAt,
    };
  });

  await writeChunks("po_contacts", payload);
  const deleted = await deleteStale("po_contacts", syncId);
  return { rows: payload.length, deleted, skipped: 0 };
}

async function startRun(dataset: Dataset) {
  const since = new Date(Date.now() - STALE_RUN_MS).toISOString();
  const { data: running, error } = await supabaseAdmin
    .from("sync_runs")
    .select("id")
    .eq("dataset", dataset)
    .eq("status", "running")
    .gte("started_at", since)
    .limit(1);
  throwIfError(error, "sync_runs check");
  if (running?.length) {
    throw new AppError(
      409,
      `Sync for ${dataset} is already running`,
      "SYNC_RUNNING",
    );
  }

  const { data, error: insertError } = await supabaseAdmin
    .from("sync_runs")
    .insert({ dataset, status: "running" })
    .select("id")
    .single();
  throwIfError(insertError, "sync_runs insert");
  return data!.id as string;
}

async function runTracked(
  dataset: Dataset,
  job: () => Promise<JobResult>,
): Promise<SyncOutcome> {
  const started = Date.now();
  const runId = await startRun(dataset);

  try {
    const result = await job();
    await supabaseAdmin
      .from("sync_runs")
      .update({
        status: "ok",
        ...result,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    return { dataset, ok: true, durationMs: Date.now() - started, ...result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabaseAdmin
      .from("sync_runs")
      .update({
        status: "failed",
        error: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    throw err;
  }
}

export async function syncDatasets(
  which: Dataset | "all",
  force: boolean,
): Promise<SyncOutcome[]> {
  const datasets: Dataset[] = which === "all" ? ["orders", "po"] : [which];
  const outcomes: SyncOutcome[] = [];

  for (const dataset of datasets) {
    const started = Date.now();
    try {
      outcomes.push(
        await runTracked(dataset, () =>
          dataset === "orders" ? syncOrders(force) : syncPo(),
        ),
      );
    } catch (err) {
      outcomes.push({
        dataset,
        ok: false,
        durationMs: Date.now() - started,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return outcomes;
}

export async function recentRuns() {
  const { data, error } = await supabaseAdmin
    .from("sync_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);
  throwIfError(error, "sync_runs list");
  return data ?? [];
}
