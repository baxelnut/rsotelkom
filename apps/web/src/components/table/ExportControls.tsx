// Style
import "./ExportControls.css";
// Components
import { Button, Dropdown, type DropdownOption } from "@/components";
// Utils
import { cx } from "@/utils/cx";

interface ExportControlsProps {
  format: string;
  options: DropdownOption[];
  onFormatChange: (value: string) => void;
  onExport: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ExportControls({
  format,
  options,
  onFormatChange,
  onExport,
  loading = false,
  disabled = false,
  className,
}: ExportControlsProps) {
  return (
    <div
      className={cx("export-controls stack row middle nowrap gap-2", className)}
    >
      <Button
        text="Ekspor sebagai"
        size="sm"
        loading={loading}
        disabled={disabled}
        onClick={onExport}
      />
      <Dropdown
        name="format"
        aria-label="Export format"
        size="sm"
        options={options}
        value={format}
        onChange={(e) => onFormatChange(e.target.value)}
      />
    </div>
  );
}
