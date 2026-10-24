const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function editLog(email: string, at = new Date()): string {
  const p = Object.fromEntries(
    formatter.formatToParts(at).map((part) => [part.type, part.value]),
  );
  return `Last edited: ${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute} by ${email}`;
}
