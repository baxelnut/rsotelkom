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
          label="Name"
          value={values.fullName}
          error={errors.fullName}
          onChange={onChange}
          autoComplete="off"
        />
        <InputField
          name="email"
          type="email"
          label="Email"
          value={values.email}
          error={errors.email}
          hint={isCreate ? undefined : "Email cannot be changed."}
          onChange={onChange}
          readOnly={!isCreate}
          autoComplete="off"
        />
        {isCreate && (
          <InputField
            name="password"
            type="password"
            label="Password"
            value={values.password}
            error={errors.password}
            hint="At least 8 characters."
            onChange={onChange}
            obscurial
            autoComplete="new-password"
          />
        )}
        <InputField
          name="telegramId"
          label="Telegram ID"
          value={values.telegramId}
          error={errors.telegramId}
          hint="Optional. Numbers only."
          onChange={onChange}
          inputMode="numeric"
          autoComplete="off"
        />
        <Dropdown
          name="role"
          label="Role"
          options={roleOptions}
          value={values.role}
          hint={roleLocked ? "You cannot change your own role." : undefined}
          onChange={onChange}
          disabled={roleLocked}
        />

        <div className="stack row end gap-2">
          <Button
            text="Cancel"
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
