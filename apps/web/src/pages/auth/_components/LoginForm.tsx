// Style
import "./LoginForm.css";
// Components
import { Button, Checkbox, ErrorMessage, InputField } from "@/components";
import { Greetings } from "./Greetings";
// Hooks
import type { LoginFormApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";

export function LoginForm({
  isSignup,
  fields,
  setField,
  remember,
  setRemember,
  message,
  submitting,
  submit,
  forgotPassword,
  toggleMode,
}: LoginFormApi) {
  return (
    <form className="stack col gap-4" onSubmit={submit}>
      <div className="stack col gap-1">
        <Greetings />
        <p className="text sm muted">
          {isSignup ? "Buat akun" : "Silakan masuk untuk melanjutkan"}
        </p>
      </div>

      {isSignup && (
        <>
          <InputField
            name="full_name"
            label="Full name"
            placeholder="Masukkan nama lengkap"
            autoComplete="name"
            value={fields.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            fullWidth
            required
          />
          <InputField
            name="telegram_id"
            label="Telegram ID"
            placeholder="Masukkan Telegram ID"
            inputMode="numeric"
            value={fields.telegramId}
            onChange={(e) => setField("telegramId", e.target.value)}
            fullWidth
            required
          />
        </>
      )}

      <InputField
        name="email"
        type="email"
        label="Email"
        placeholder="Masukkan email"
        autoComplete="email"
        value={fields.email}
        onChange={(e) => setField("email", e.target.value)}
        fullWidth
        required
      />
      <InputField
        name="password"
        type="password"
        label="Kata sandi"
        placeholder="Masukkan kata sandi"
        autoComplete={isSignup ? "new-password" : "current-password"}
        minLength={isSignup ? 6 : undefined}
        value={fields.password}
        onChange={(e) => setField("password", e.target.value)}
        obscurial
        fullWidth
        required
      />

      {!isSignup && (
        <div className="stack row between middle nowrap">
          <Checkbox
            label="Ingat saya"
            checked={remember}
            onChange={setRemember}
          />
          <Button
            text="Lupa kata sandi?"
            variant="ghost"
            size="sm"
            onClick={forgotPassword}
          />
        </div>
      )}

      {message?.kind === "error" && <ErrorMessage message={message.text} />}
      {message && message.kind !== "error" && (
        <div
          className={cx(
            "card flat",
            message.kind === "success" ? "safe" : "danger",
          )}
          role="status"
        >
          <p className="text sm">{message.text}</p>
        </div>
      )}

      <div className="stack row center middle gap-1">
        <p className="text sm muted">
          {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}
        </p>
        <u className="text sm bold auth-toggle" onClick={toggleMode}>
          {isSignup ? "Masuk" : "Daftar"}
        </u>
      </div>

      <Button
        type="submit"
        text={isSignup ? "Sign up" : "Login"}
        loading={submitting}
        block
      />
    </form>
  );
}
