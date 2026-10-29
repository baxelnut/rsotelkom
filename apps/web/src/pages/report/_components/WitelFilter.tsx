import { WITEL_ORDER } from "@/config/galaksi";
// Style
import "./WitelFilter.css";
// Components
import { Button, Checkbox } from "@/components";

interface WitelFilterProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

export function WitelFilter({ selected, onChange }: WitelFilterProps) {
  const toggle = (w: string, checked: boolean) =>
    onChange(checked ? [...selected, w] : selected.filter((x) => x !== w));

  return (
    <div className="stack col gap-2" role="group" aria-label="Filter Witel">
      <div className="stack row middle gap-3">
        <span className="text sm muted">Witel</span>
        <Button
          text="Reset"
          size="sm"
          variant="outline"
          onClick={() => onChange([])}
          disabled={selected.length === 0}
        />
      </div>

      <div className="stack row wrap gap-3">
        {WITEL_ORDER.map((w) => (
          <Checkbox
            key={w}
            label={w}
            checked={selected.includes(w)}
            onChange={(c) => toggle(w, c)}
          />
        ))}
      </div>
    </div>
  );
}
