// Style
import "./SettingsPage.css";
// Components
import { Seo } from "@/components";
import { AppearanceCard, PasswordCard } from "./_components";
import { ProfileCard, SyncCard } from "./_components";
// Contexts
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
// Hooks
import { usePasswordReset, useProfileForm, useSyncPanel } from "@/hooks";

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const profileForm = useProfileForm();
  const passwordReset = usePasswordReset();
  const syncPanel = useSyncPanel();

  return (
    <div className="page settings-page">
      <Seo page="settings" />

      <div className="cards-container row-1-1 settings-page__top">
        <ProfileCard {...profileForm} />
        <div className="cards-container col">
          <PasswordCard {...passwordReset} />
          <AppearanceCard isDarkMode={isDarkMode} onChange={setIsDarkMode} />
        </div>
      </div>

      {isAdmin && <SyncCard {...syncPanel} />}
    </div>
  );
}
