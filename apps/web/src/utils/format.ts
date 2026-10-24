const SUFFIXES = ["", "K", "M", "B"];

export function formatCompact(value: number | string): string {
  const sign = Number(value) < 0 ? "-" : "";
  let amount = Math.abs(Number(value));
  if (Number.isNaN(amount)) return "0";

  let index = 0;
  while (amount >= 1000 && index < SUFFIXES.length - 1) {
    amount /= 1000;
    index++;
  }
  return `${sign}${amount.toFixed(1)}${SUFFIXES[index]}`;
}

export function formatNumber(value: number | string): string {
  return (Number(value) || 0).toLocaleString("id-ID");
}

export function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
