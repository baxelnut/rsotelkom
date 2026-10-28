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
      title="Kata Sandi"
      description="Ubah melalui tautan aman yang dikirim ke email Anda."
      iconName="lockFill"
      notice={notice}
    >
      <p className="text sm">
        Kami akan mengirimkan tautan pengaturan reset ke{" "}
        <strong>{email}</strong>
      </p>
      <Button
        text={
          cooldown > 0 ? `Kirim lagi dalam ${cooldown}` : "Kirim reset email"
        }
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
