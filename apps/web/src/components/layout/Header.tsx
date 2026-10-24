import { useEffect, useRef, useState } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
// Style
import "./Header.css";
// Components
import { Avatar, Button, Icon, UserProfile } from "@/components";
// Contexts
import { useAuth } from "@/contexts/auth";
import { useLayout } from "@/contexts/layout";
import { useTheme } from "@/contexts/theme";

interface HeaderProps {
  title: string;
}

const TELEGRAM_PROMPT_KEY = "telegram-prompt-shown";

export function Header({ title }: HeaderProps) {
  const { profile } = useAuth();
  const { toggleSidebar, isMobileMenuOpen } = useLayout();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = profile?.fullName || "Guest";
  const needsTelegram = !!profile && !profile.telegramId;
  const promptChecked = useRef(false);

  // Nudge once per browser to add a Telegram ID.
  useEffect(() => {
    if (!needsTelegram || promptChecked.current) return;
    promptChecked.current = true;
    try {
      if (localStorage.getItem(TELEGRAM_PROMPT_KEY)) return;
      localStorage.setItem(TELEGRAM_PROMPT_KEY, "1");
    } catch {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setProfileOpen(true);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [needsTelegram]);

  return (
    <header className="app-header">
      <div className="app-header__left">
        <Button
          variant="ghost"
          iconName="list"
          iconSize={22}
          className="app-header__menu"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
          aria-controls="app-sidebar"
          aria-expanded={isMobileMenuOpen}
        />
        <h1 className="app-header__title">{title}</h1>
      </div>

      <div className="app-header__right">
        <div
          className="app-header__theme"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <DarkModeSwitch
            checked={isDarkMode}
            onChange={setIsDarkMode}
            size={20}
          />
        </div>

        {/* Not a Button: it is an avatar chip, not a standard action */}
        <button
          type="button"
          className="app-header__profile"
          onClick={() => setProfileOpen(true)}
          aria-haspopup="dialog"
          aria-label="Open profile"
        >
          <span className="app-header__avatar">
            <Avatar src={profile?.imageUrl} name={displayName} size="md" />
            {needsTelegram && (
              <span
                className="app-header__dot"
                title="Add your Telegram ID"
                aria-hidden="true"
              />
            )}
          </span>
          <span className="app-header__name">{displayName}</span>
          <Icon
            className="app-header__chevron"
            iconName="chevronDown"
            size={14}
            fillRule="evenodd"
          />
        </button>
      </div>

      {profileOpen && <UserProfile onClose={() => setProfileOpen(false)} />}
    </header>
  );
}
