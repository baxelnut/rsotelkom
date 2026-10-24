import type { DropdownOption } from "@/components";
import { ALL } from "@/config/overview";

export function uniqueValues<T>(
  rows: T[] | undefined,
  pick: (row: T) => string | null | undefined,
): string[] {
  return [...new Set((rows ?? []).map(pick).filter((v): v is string => !!v))];
}

export function withAllOption(values: string[]): DropdownOption[] {
  return [
    { value: ALL, label: ALL },
    ...values.map((value) => ({ value, label: value })),
  ];
}
