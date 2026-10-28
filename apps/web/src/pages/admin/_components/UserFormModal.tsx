// Style
import "./UserFormModal.css";
// Components
import { Button, Dropdown, InputField, Modal } from "@/components";
// Hooks
import type { UserEditorApi } from "@/hooks";

export function UserFormModal({
  isOpen,
  isCreate,
  title,
  submitText,
  values,
  errors,
  error,
  pending,
  roleLocked,
  roleOptions,
  close,
  onChange,
  submit,
}: UserEditorApi) {
  if (!isOpen) return null;

  return (
    <Modal title={title} onClose={close} closeDisabled={pending}>
      <form className="stack col gap-4" onSubmit={submit} noValidate>
        {error && (
          <p className="card flat danger text sm" role="alert">
            {error}
          </p>
        )}

        <InputField
          name="fullName"
          label="Nama"
          value={values.fullName}
          error={errors.fullName}
          onChange={onChange}
          autoComplete="off"
          fullWidth
        />
        <InputField
          name="email"
          type="email"
          label="Email"
          value={values.email}
          error={errors.email}
          hint={isCreate ? undefined : "Email tidak dapat diubah."}
          onChange={onChange}
          readOnly={!isCreate}
          autoComplete="off"
          fullWidth
        />
        {isCreate && (
          <InputField
            name="password"
            type="password"
            label="Kata sandi"
            value={values.password}
            error={errors.password}
            hint="Minimal 8 karakter."
            onChange={onChange}
            obscurial
            autoComplete="new-password"
            fullWidth
          />
        )}
        <InputField
          name="telegramId"
          label="Telegram ID"
          value={values.telegramId}
          error={errors.telegramId}
          hint="Hanya angka."
          onChange={onChange}
          inputMode="numeric"
          autoComplete="off"
          fullWidth
        />
        <Dropdown
          name="role"
          label="Role"
          options={roleOptions}
          value={values.role}
          hint={
            roleLocked
              ? "Anda tidak dapat mengubah role Anda sendiri."
              : undefined
          }
          onChange={onChange}
          disabled={roleLocked}
          fullWidth
        />

        <div className="stack row end gap-2">
          <Button
            text="Batal"
            variant="ghost"
            onClick={close}
            disabled={pending}
          />
          <Button type="submit" text={submitText} loading={pending} />
        </div>
      </form>
    </Modal>
  );
}
