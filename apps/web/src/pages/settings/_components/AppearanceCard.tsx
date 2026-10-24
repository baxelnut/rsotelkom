import { DarkModeSwitch } from "react-toggle-dark-mode";
// Style
import "./AppearanceCard.css";
// Components
import { SettingsCard } from "./SettingsCard";

interface AppearanceCardProps {
  isDarkMode: boolean;
  onChange: (isDark: boolean) => void;
}

export function AppearanceCard({ isDarkMode, onChange }: AppearanceCardProps) {
  return (
    <SettingsCard
      title="Appearance"
      description="Pick the theme that is easiest on your eyes."
      iconName="circleHalf"
    >
      <div className="stack row between middle nowrap gap-3">
        <span className="text sm semibold ink">
          {isDarkMode ? "Dark mode" : "Light mode"}
        </span>
        <div
          className="appearance-card__switch"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <DarkModeSwitch checked={isDarkMode} onChange={onChange} size={28} />
        </div>
      </div>
    </SettingsCard>
  );
}
