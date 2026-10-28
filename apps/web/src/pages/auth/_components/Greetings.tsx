// Style
import "./Greetings.css";
// Hooks
import { useGreeting } from "@/hooks";

export function Greetings() {
  const greeting = useGreeting();
  return <h5 className="greetings-text">{greeting}</h5>;
}
