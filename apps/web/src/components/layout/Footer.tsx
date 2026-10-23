import { useEffect, useState } from "react";
// Style
import "./Footer.css";

/** Isolated so only this node re-renders every second */
function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time dateTime={now.toISOString()} className="text sm muted num">
      {now.toLocaleTimeString()}
    </time>
  );
}

export function Footer() {
  return (
    <footer className="app-footer">
      <p className="text sm muted">
        PT Telkom Indonesia, © {new Date().getFullYear()}
      </p>
      <Clock />
    </footer>
  );
}
