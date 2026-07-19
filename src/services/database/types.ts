export type QueryResult<T = Record<string, unknown>> = {
  data: T[];
  error: string | null;
  success: boolean;
};
