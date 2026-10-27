// Style
import "./KategoriFilter.css";
// Components
import { Checkbox } from "@/components";

interface KategoriFilterProps {
  options: readonly string[];
  selected: string[];
  onToggle: (name: string) => void;
}

export function KategoriFilter({
  options,
  selected,
  onToggle,
}: KategoriFilterProps) {
  return (
    <div className="card flat stack col gap-3">
      <p className="text eyebrow">Kategori</p>
      <div className="stack row gap-4">
        {options.map((name) => (
          <Checkbox
            key={name}
            label={name}
            checked={selected.includes(name)}
            onChange={() => onToggle(name)}
          />
        ))}
      </div>
    </div>
  );
}
