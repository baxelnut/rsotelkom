import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
// Style
import "./UserProfile.css";
// Components
import { Avatar, Icon } from "@/components";
// Context
import { useAuth } from "@/contexts/auth";
// Utils
import { cx } from "@/utils/cx";

interface UserProfileProps {
  onClose: () => void;
}

type Notice = { tone: "success" | "error"; message: string } | null;

interface FieldProps {
  label: string;
  value: string;
  fallback?: string;
  missing?: boolean;
  /** When set, the field renders as an input */
  name?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

function ProfileField({
  label,
  value,
  fallback = "",
  missing = false,
  name,
  placeholder,
  onChange,
}: FieldProps) {
  const id = useId();
  const editing = !!onChange;

  return (
    <div className="field">
      {editing ? (
        <label className="text caption" htmlFor={id}>
          {label}
        </label>
      ) : (
        <span className="text caption">{label}</span>
      )}

      {editing ? (
        <input
          id={id}
          name={name}
          className="input"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          autoComplete="off"
        />
      ) : (
        <div className={cx("profile-value", missing && "is-missing")}>
          {value || fallback}
        </div>
      )}
    </div>
  );
}

export function UserProfile({ onClose }: UserProfileProps) {
  const navigate = useNavigate();
  const { profile, updateProfile, resetPassword, signOut } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [draft, setDraft] = useState({ fullName: "", telegramId: "" });

  // Focus the dialog on open, close on Escape
  useEffect(() => {
    dialogRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!profile) return null;

  const hasTelegram = !!profile.telegramId;
  const displayName = profile.fullName || "Guest";

  const startEditing = () => {
    setDraft({ fullName: profile.fullName, telegramId: profile.telegramId });
    setNotice(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNotice(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEditing || pending) return;

    if (!draft.fullName.trim()) {
      setNotice({ tone: "error", message: "Name can't be empty." });
      return;
    }

    setPending(true);
    setNotice(null);
    const { error } = await updateProfile(draft);
    setPending(false);

    if (error) {
      setNotice({ tone: "error", message: error });
      return;
    }
    setIsEditing(false);
    setNotice({ tone: "success", message: "Profile updated." });
  };

  const handlePasswordReset = async () => {
    setPending(true);
    setNotice(null);
    const { error } = await resetPassword();
    setPending(false);
    setNotice(
      error
        ? { tone: "error", message: error }
        : {
            tone: "success",
            message: `Password reset email sent to ${profile.email}.`,
          },
    );
  };

  const handleSignOut = async () => {
    setPending(true);
    const { error } = await signOut();
    setPending(false);
    if (error) {
      setNotice({ tone: "error", message: "Couldn't sign out. Try again." });
      return;
    }
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <div className="profile-overlay" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="card profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="profile-dialog__header">
          <h2 id={titleId} className="profile-dialog__title">
            Profile
          </h2>
          <button
            type="button"
            className="btn ghost icon sm"
            onClick={onClose}
            aria-label="Close profile"
          >
            <Icon iconName="xLg" size={18} />
          </button>
        </div>

        <div className="profile-dialog__identity">
          <Avatar src={profile.imageUrl} name={displayName} size="xl" />
        </div>

        {!hasTelegram && !isEditing && (
          <p className="profile-notice profile-notice--attention" role="status">
            Add your Telegram ID so we can reach you.
          </p>
        )}
        {notice && (
          <p
            className={cx("profile-notice", `profile-notice--${notice.tone}`)}
            role="status"
          >
            {notice.message}
          </p>
        )}

        <form
          id="profile-form"
          className="profile-dialog__form"
          onSubmit={handleSubmit}
        >
          <ProfileField
            name="fullName"
            label="Name"
            value={isEditing ? draft.fullName : profile.fullName}
            fallback="Guest"
            onChange={isEditing ? handleChange : undefined}
          />
          <ProfileField
            name="telegramId"
            label="Telegram ID"
            value={isEditing ? draft.telegramId : profile.telegramId}
            fallback="Please add your Telegram ID"
            missing={!hasTelegram}
            placeholder="Enter your Telegram ID"
            onChange={isEditing ? handleChange : undefined}
          />
          <ProfileField
            label="Email"
            value={profile.email}
            fallback="Unauthenticated"
          />
        </form>

        <div className="profile-dialog__actions">
          {isEditing ? (
            <>
              <button
                type="submit"
                form="profile-form"
                className="btn block"
                disabled={pending}
              >
                {pending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn ghost block"
                onClick={cancelEditing}
                disabled={pending}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className={cx("btn block", hasTelegram ? "outline" : "secondary")}
              onClick={startEditing}
              disabled={pending}
            >
              {hasTelegram ? "Edit profile" : "Add Telegram ID"}
            </button>
          )}

          <button
            type="button"
            className="btn outline block"
            onClick={handlePasswordReset}
            disabled={pending}
          >
            Change password
          </button>
          <button
            type="button"
            className="btn ghost block profile-dialog__signout"
            onClick={handleSignOut}
            disabled={pending}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
