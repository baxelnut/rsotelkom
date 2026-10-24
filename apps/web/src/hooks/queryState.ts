interface QueryLike {
  isLoading: boolean;
  error: Error | null;
  refetch: () => unknown;
}

export function queryState(query: QueryLike) {
  return {
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    onRetry: () => {
      void query.refetch();
    },
  };
}
