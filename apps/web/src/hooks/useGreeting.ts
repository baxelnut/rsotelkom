import { useEffect, useState } from "react";

function greetingFor() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  return "Good evening!";
}

export function useGreeting() {
  const [greeting, setGreeting] = useState(greetingFor);

  useEffect(() => {
    const id = setInterval(() => setGreeting(greetingFor()), 60_000);
    return () => clearInterval(id);
  }, []);

  return greeting;
}
