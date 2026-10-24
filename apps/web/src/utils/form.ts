/** id of the helper text currently shown under a field (error wins over hint) */
export function describedBy(
  id: string,
  hint?: string,
  error?: string,
): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
