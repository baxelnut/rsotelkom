import { useCallback, useState } from "react";

export type Notice = { tone: "safe" | "danger"; message: string } | null;

export function useNotice() {
  const [notice, setNotice] = useState<Notice>(null);

  const success = useCallback(
    (message: string) => setNotice({ tone: "safe", message }),
    [],
  );
  const failure = useCallback(
    (message: string) => setNotice({ tone: "danger", message }),
    [],
  );
  const clear = useCallback(() => setNotice(null), []);

  return { notice, success, failure, clear };
}
