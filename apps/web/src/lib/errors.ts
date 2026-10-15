export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error: unknown }).error;
    if (typeof value === "string") return value;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
