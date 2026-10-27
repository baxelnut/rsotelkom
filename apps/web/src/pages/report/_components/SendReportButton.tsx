// Style
import "./SendReportButton.css";
// Components
import { Button, ErrorMessage } from "@/components";
// Hooks
import type { SendReportApi } from "@/hooks";

export function SendReportButton({
  confirming,
  ask,
  cancel,
  send,
  isSending,
  notice,
  error,
}: SendReportApi) {
  return (
    <div className="stack col gap-2 send-report">
      <div className="stack row end middle gap-2">
        {confirming || isSending ? (
          <>
            <p className="text sm muted">
              Kirim laporan ke channel Telegram sekarang?
            </p>
            <Button
              text="Batal"
              variant="ghost"
              size="sm"
              onClick={cancel}
              disabled={isSending}
            />
            <Button
              text="Ya, kirim"
              iconName="send"
              size="sm"
              loading={isSending}
              onClick={send}
            />
          </>
        ) : (
          <Button
            text="Kirim ke Telegram"
            iconName="telegram"
            variant="secondary"
            size="sm"
            onClick={ask}
          />
        )}
      </div>

      {notice && (
        <p className="card flat safe text sm" role="status">
          {notice}
        </p>
      )}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
