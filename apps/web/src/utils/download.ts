export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function makeFilename(...parts: string[]): string {
  const date = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  });
  return [...parts, date].join("_").replace(/[<>:"/\\|?*]/g, "_");
}
