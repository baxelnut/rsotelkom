import { useState } from "react";
// Style
import "./NotesField.css";
// Components
import { TextareaField } from "@/components";

interface NotesFieldProps {
  initial: string;
  onSave: (notes: string) => Promise<void>;
}

export function NotesField({ initial, onSave }: NotesFieldProps) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial.trim());
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const commit = async () => {
    const next = value.trim();
    if (next === saved || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await onSave(next);
      setSaved(next);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TextareaField
      name="notes"
      aria-label="Notes"
      rows={2}
      fullWidth
      resizable
      value={value}
      disabled={saving}
      error={failed ? "Could not save. Click away to retry." : undefined}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => void commit()}
    />
  );
}
