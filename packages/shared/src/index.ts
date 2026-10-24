export * from "./contracts";

export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}
