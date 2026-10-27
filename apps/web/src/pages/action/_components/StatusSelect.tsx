import { useState } from "react";
// Style
import "./StatusSelect.css";
// Components
import { Dropdown } from "@/components";
// Config
import { EDITABLE_STATUSES } from "@/config/action";
// Utils
import { cx } from "@/utils/cx";

interface StatusSelectProps {
  initial: string;
  onSave: (status: string) => Promise<void>;
}

const BASE_OPTIONS = [
  { value: "", label: "No status" },
  ...EDITABLE_STATUSES.map((status) => ({ value: status, label: status })),
];

const TONE: Record<string, string> = {
  lanjut: "safe",
  cancel: "danger",
  "bukan order reg": "secondary",
};

function canonical(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (!key) return "";
  return (
    BASE_OPTIONS.find((o) => o.value.toLowerCase() === key)?.value ?? raw.trim()
  );
}

export function StatusSelect({ initial, onSave }: StatusSelectProps) {
  const [value, setValue] = useState(() => canonical(initial));
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const options = BASE_OPTIONS.some((o) => o.value === value)
    ? BASE_OPTIONS
    : [...BASE_OPTIONS, { value, label: value }];

  const change = async (next: string) => {
    const previous = value;
    setValue(next);
    setSaving(true);
    setFailed(false);
    try {
      await onSave(next);
    } catch {
      setValue(previous);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={cx(
        "status-select",
        value && `tone-${TONE[value.toLowerCase()] ?? "secondary"}`,
      )}
    >
      <Dropdown
        name="status"
        aria-label="Action status"
        size="sm"
        fullWidth
        options={options}
        value={value}
        disabled={saving}
        error={failed ? "Tidak dapat menyimpan. Coba lagi." : undefined}
        onChange={(e) => void change(e.target.value)}
      />
    </div>
  );
}
