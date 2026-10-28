import { useEffect, useState } from "react";

function greetingFor() {
  const hour = new Date().getHours();
  if (hour < 12) return "Semangat pagi!";
  if (hour < 17) return "Selamat siang!";
  return "Selamat malam!";
}

export function useGreeting() {
  const [greeting, setGreeting] = useState(greetingFor);

  useEffect(() => {
    const id = setInterval(() => setGreeting(greetingFor()), 60_000);
    return () => clearInterval(id);
  }, []);

  return greeting;
}
