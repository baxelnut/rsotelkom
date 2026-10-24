// Style
import "./LoginPage.css";
// Components
import { LoginForm } from "./_components";
// Hooks
import { useForceLightTheme, useLoginForm } from "@/hooks";

export default function LoginPage() {
  useForceLightTheme();
  const form = useLoginForm();

  return (
    <div className="page login-page">
      <img
        className="login-page__logo"
        src="/telkom-big.svg"
        alt="Telkom Indonesia"
      />
      <div className="card login-page__card">
        <LoginForm {...form} />
      </div>
    </div>
  );
}
