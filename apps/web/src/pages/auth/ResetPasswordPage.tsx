import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
// Style
import "./LoginPage.css";
// Config
import { supabase } from "@/config/supabase";
// Contexts & Hooks
import { useAuth } from "@/contexts/auth";
import { useForceLightTheme } from "@/hooks";
// Components
import { Button, ErrorMessage, InputField, LoadingSpinner } from "@/components";

export default function ResetPasswordPage() {
  useForceLightTheme();
  const navigate = useNavigate();
  const { authLoading, session } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="page loading">
        <LoadingSpinner />
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Kata sandi tidak sama.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="page login-page">
      <div className="card login-page__card">
        {!session ? (
          <div className="stack col gap-3">
            <ErrorMessage message="Tautan tidak valid atau sudah kedaluwarsa. Minta tautan reset baru." />
            <Button
              text="Kembali ke login"
              block
              onClick={() => navigate("/login")}
            />
          </div>
        ) : (
          <form className="stack col gap-4" onSubmit={submit}>
            <h6>Atur kata sandi baru</h6>
            <InputField
              name="password"
              type="password"
              label="Kata sandi baru"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              obscurial
              fullWidth
              required
            />
            <InputField
              name="confirm"
              type="password"
              label="Ulangi kata sandi"
              autoComplete="new-password"
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              obscurial
              fullWidth
              required
            />
            {error && <ErrorMessage message={error} />}
            <Button type="submit" text="Simpan" loading={submitting} block />
          </form>
        )}
      </div>
    </div>
  );
}
