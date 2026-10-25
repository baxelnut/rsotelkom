import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "@rso/shared";
// Config
import { api } from "@/config/api";
// Contexts
import { useAuth } from "@/contexts/auth";

type Mode = "photo" | "text";

interface SendResult {
  aosodomoro: Mode;
  galaksi: Mode;
  alerts: number;
}

export function useSendReport() {
  const { isAdmin } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await api<ApiResponse<SendResult>>("/telegram/send-report", {
          method: "POST",
        })
      ).data,
    onSettled: () => setConfirming(false),
  });

  const result = mutation.data;
  const fallback =
    !!result && (result.aosodomoro === "text" || result.galaksi === "text");

  return {
    canSend: isAdmin,
    confirming,
    ask: () => {
      mutation.reset();
      setConfirming(true);
    },
    cancel: () => setConfirming(false),
    send: () => mutation.mutate(),
    isSending: mutation.isPending,
    notice: result
      ? fallback
        ? "Laporan terkirim. Tabel dikirim sebagai teks karena gambar gagal dibuat."
        : "Laporan terkirim ke channel Telegram."
      : null,
    error: mutation.error?.message ?? null,
  };
}

export type SendReportApi = ReturnType<typeof useSendReport>;
