export function getApiBaseUrl(): string {
  const fromEnv = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  // Default to local dev server if not provided
  return (fromEnv && fromEnv.trim()) || 'http://localhost:3001';
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}