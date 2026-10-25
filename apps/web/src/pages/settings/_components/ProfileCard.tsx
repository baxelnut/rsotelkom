// Style
import "./ProfileCard.css";
// Components
import { Button, InputField } from "@/components";
import { SettingsCard } from "./SettingsCard";
// Hooks
import type { ProfileFormApi } from "@/hooks";

export function ProfileCard({
  values,
  errors,
  email,
  isDirty,
  canSubmit,
  pending,
  notice,
  onChange,
  submit,
  reset,
}: ProfileFormApi) {
  return (
    <SettingsCard
      title="Profil"
      description="Bagaimana Anda tampil dan bagaimana kami menghubungi Anda."
      iconName="personFill"
      notice={notice}
    >
      <form className="stack col gap-4" onSubmit={submit} noValidate>
        <InputField
          name="fullName"
          label="Name"
          value={values.fullName}
          error={errors.fullName}
          onChange={onChange}
          autoComplete="name"
          fullWidth
        />
        <InputField
          name="telegramId"
          label="Telegram ID"
          value={values.telegramId}
          error={errors.telegramId}
          hint="Hanya angka. Kosongkan untuk menghapusnya."
          onChange={onChange}
          inputMode="numeric"
          autoComplete="off"
          fullWidth
        />
        <InputField
          name="email"
          label="Email"
          value={email}
          readOnly
          fullWidth
        />

        <div className="stack row end gap-2">
          <Button
            text="Reset"
            variant="ghost"
            onClick={reset}
            disabled={!isDirty || pending}
          />
          <Button
            type="submit"
            text="Simpan perubahan"
            loading={pending}
            disabled={!canSubmit}
          />
        </div>
      </form>
    </SettingsCard>
  );
}
