import { useState } from "react";
// Style
import "./StatusSelect.css";
// Components
import { Dropdown } from "@/components";
// Config
import { EDITABLE_STATUSES } from "@/config/action";

interface StatusSelectProps {
  initial: string;
  onSave: (status: string) => Promise<void>;
}

const OPTIONS = [
  { value: "", label: "No status" },
  ...EDITABLE_STATUSES.map((status) => ({ value: status, label: status })),
];

export function StatusSelect({ initial, onSave }: StatusSelectProps) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

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
    <Dropdown
      name="status"
      aria-label="Action status"
      size="sm"
      fullWidth
      options={OPTIONS}
      value={value}
      disabled={saving}
      error={failed ? "Could not save. Try again." : undefined}
      onChange={(e) => void change(e.target.value)}
    />
  );
}
