import { env } from "../../config/env";
import { AppError } from "../../lib/errors";

export async function refreshNMinus1(): Promise<boolean> {
  if (!env.GAS_WEBAPP_URL || !env.GAS_SECRET) {
    console.warn("GAS not configured, skipping N-1 refresh");
    return false;
  }

  const res = await fetch(env.GAS_WEBAPP_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      secret: env.GAS_SECRET,
      action: "sync",
      meta: { triggeredBy: "api", timestamp: new Date().toISOString() },
    }),
    redirect: "follow",
    signal: AbortSignal.timeout(90_000),
  });

  const text = await res.text();
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AppError(
      502,
      `GAS returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`,
      "GAS_BAD_RESPONSE",
    );
  }
  if (!res.ok || data?.ok === false) {
    throw new AppError(
      502,
      `GAS refresh failed: ${data?.error ?? res.status}`,
      "GAS_FAILED",
    );
  }
  return true;
}
