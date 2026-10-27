import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
// Style
import "./UserProfile.css";
// Components
import { Avatar, Button } from "@/components";
// Contexts
import { useAuth } from "@/contexts/auth";
// Utils
import { cx } from "@/utils/cx";

interface UserProfileProps {
  onClose: () => void;
}

type Notice = { tone: "safe" | "danger"; message: string } | null;

interface FieldProps {
  label: string;
  value: string;
  fallback?: string;
  missing?: boolean;
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

  return (
    <div className="field">
      {onChange ? (
        <>
          <label className="text caption" htmlFor={id}>
            {label}
          </label>
          <input
            id={id}
            name={name}
            className="input"
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            autoComplete="off"
          />
        </>
      ) : (
        <>
          <span className="text caption">{label}</span>
          <div className={cx("profile-value", missing && "is-missing")}>
            {value || fallback}
          </div>
        </>
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
      setNotice({ tone: "danger", message: "Name can't be empty." });
      return;
    }

    setPending(true);
    setNotice(null);
    const { error } = await updateProfile(draft);
    setPending(false);

    if (error) {
      setNotice({ tone: "danger", message: error });
      return;
    }
    setIsEditing(false);
    setNotice({ tone: "safe", message: "Profile updated." });
  };

  const handlePasswordReset = async () => {
    setPending(true);
    setNotice(null);
    const { error } = await resetPassword();
    setPending(false);
    setNotice(
      error
        ? { tone: "danger", message: error }
        : {
            tone: "safe",
            message: `Password reset email sent to ${profile.email}.`,
          },
    );
  };

  const handleSignOut = async () => {
    setPending(true);
    const { error } = await signOut();
    setPending(false);
    if (error) {
      setNotice({ tone: "danger", message: "Tidak dapat keluar. Coba lagi." });
      return;
    }
    onClose();
    navigate("/login", { replace: true });
  };

  return createPortal(
    <div className="profile-overlay" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="card profile-dialog stack col gap-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="stack row between middle nowrap">
          <h4 id={titleId}>Profile</h4>
          <Button
            variant="ghost"
            size="sm"
            iconName="xLg"
            iconSize={18}
            onClick={onClose}
            aria-label="Close profile"
          />
        </div>

        <div className="stack center">
          <Avatar src={profile.imageUrl} name={displayName} size="xl" />
        </div>

        {!hasTelegram && !isEditing && (
          <p className="card flat danger text sm" role="status">
            Add your Telegram ID so we can reach you.
          </p>
        )}
        {notice && (
          <p className={cx("card flat text sm", notice.tone)} role="status">
            {notice.message}
          </p>
        )}

        <form
          id="profile-form"
          className="stack col gap-4"
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

        <div className="stack col gap-2">
          {isEditing ? (
            <>
              <Button
                type="submit"
                form="profile-form"
                text="Save"
                block
                loading={pending}
              />
              <Button
                text="Cancel"
                variant="ghost"
                block
                onClick={cancelEditing}
                disabled={pending}
              />
            </>
          ) : (
            <Button
              text={hasTelegram ? "Edit profil" : "Tambahkan ID Telegram"}
              variant={hasTelegram ? "outline" : "secondary"}
              block
              onClick={startEditing}
              disabled={pending}
            />
          )}

          <Button
            text="Change password"
            variant="outline"
            block
            onClick={handlePasswordReset}
            disabled={pending}
          />
          <Button
            text="Sign out"
            variant="ghost"
            block
            onClick={handleSignOut}
            disabled={pending}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
