export type AuthDiagnosticCode =
  | "AUTH_ENV_MISSING"
  | "AUTH_INIT_FAILED"
  | "AUTH_NETWORK_FAILED"
  | "AUTH_SESSION_FAILED";

export interface AuthSessionResult {
  userId: string | null;
  diagnosticCode: AuthDiagnosticCode | null;
}

export function classifyAuthError(error: { message?: string; status?: number } | null): AuthDiagnosticCode {
  if (!error) return "AUTH_SESSION_FAILED";
  const message = (error.message ?? "").toLowerCase();
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    error.status === 0
  ) {
    return "AUTH_NETWORK_FAILED";
  }
  return "AUTH_SESSION_FAILED";
}
