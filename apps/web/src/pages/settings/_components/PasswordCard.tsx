// Style
import "./PasswordCard.css";
// Components
import { Button } from "@/components";
import { SettingsCard } from "./SettingsCard";
// Hooks
import type { PasswordResetApi } from "@/hooks";

export function PasswordCard({
  email,
  pending,
  cooldown,
  notice,
  send,
}: PasswordResetApi) {
  return (
    <SettingsCard
      title="Password"
      description="Change it through a secure link sent to your email."
      iconName="lockFill"
      notice={notice}
    >
      <p className="text sm">
        We will email a reset link to <strong>{email}</strong>.
      </p>
      <Button
        text={cooldown > 0 ? `Send again in ${cooldown}s` : "Send reset email"}
        variant="outline"
        iconName="envelope"
        loading={pending}
        disabled={cooldown > 0 || !email}
        onClick={send}
        block
      />
    </SettingsCard>
  );
}
