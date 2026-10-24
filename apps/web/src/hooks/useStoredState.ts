import { useCallback, useState } from "react";

export function useStoredState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return validate(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
    },
    [key],
  );

  return [value, update] as const;
}
