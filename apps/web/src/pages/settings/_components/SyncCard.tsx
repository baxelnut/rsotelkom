// Style
import "./SyncCard.css";
// Components
import { Button, CardContent, EmptyMessage } from "@/components";
import { SettingsCard } from "./SettingsCard";
// Hooks
import type { SyncPanelApi } from "@/hooks";
// Types
import type { Dataset, SyncRun } from "@rso/shared";
// Utils
import { cx } from "@/utils/cx";
import { formatDateTime, formatNumber } from "@/utils/format";

const DATASET_LABEL: Record<Dataset, string> = { orders: "Orders", po: "PO" };

const STATUS: Record<SyncRun["status"], { label: string; tone: string }> = {
  ok: { label: "Success", tone: "safe" },
  failed: { label: "Failed", tone: "danger" },
  running: { label: "Running", tone: "primary" },
};

export function SyncCard({
  lastSynced,
  history,
  isLoading,
  error,
  retry,
  isRunning,
  run,
  notice,
}: SyncPanelApi) {
  return (
    <SettingsCard
      title="Data sync"
      description="Data disinkronkan secara otomatis dua kali sehari."
      iconName="repeat"
      notice={notice}
    >
      <div className="stack row between middle gap-3">
        <div className="stack col gap-1 flex-1">
          <span className="text caption">Last synced</span>
          <p className="text semibold ink">
            {lastSynced ? formatDateTime(lastSynced) : "Never"}
          </p>
        </div>
        <Button
          text="Sync now"
          iconName="repeat"
          loading={isRunning}
          onClick={run}
        />
      </div>

      <div className="stack col gap-2">
        <span className="text caption">Recent runs</span>
        <CardContent isLoading={isLoading} error={error} onRetry={retry}>
          {history.length === 0 ? (
            <EmptyMessage title="No sync runs yet" />
          ) : (
            <ul className="sync-card__list">
              {history.map((item) => {
                const status = STATUS[item.status];
                return (
                  <li
                    key={item.id}
                    className="sync-card__row stack row between middle nowrap gap-3"
                  >
                    <div className="sync-card__meta stack col gap-1 flex-1">
                      <span className="text sm semibold ink">
                        {DATASET_LABEL[item.dataset]}
                      </span>
                      <span className="text sm muted">
                        {formatDateTime(item.finished_at ?? item.started_at)}
                        {item.rows !== null &&
                          ` · ${formatNumber(item.rows)} rows`}
                      </span>
                      {item.error && (
                        <span className="text sm danger">{item.error}</span>
                      )}
                    </div>
                    <span className={cx("badge", status.tone)}>
                      {status.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </div>
    </SettingsCard>
  );
}
