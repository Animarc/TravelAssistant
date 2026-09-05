import type { AuthResponse, ProblemDetails } from './contracts';

const localApiHost = import.meta.env.DEV ? window.location.hostname : 'localhost';
export const SESSION_API_URL = import.meta.env.VITE_SESSION_API_URL ?? `http://${localApiHost}:5010`;
export const TRAVELS_API_URL = import.meta.env.VITE_TRAVELS_API_URL ?? `http://${localApiHost}:5101`;

// Remove credentials written by builds predating the HttpOnly cookie flow.
try { localStorage.removeItem('kakomu.session:v1'); } catch { /* Storage may be unavailable. */ }

export class ApiError extends Error {
  constructor(public status: number, public code: string, public problem?: ProblemDetails) {
    super(code);
    this.name = 'ApiError';
  }
}

let currentSession: AuthResponse | null = null;

export const getStoredSession = (): AuthResponse | null => currentSession;

export const saveSession = (session: AuthResponse | null) => {
  currentSession = session;
};

let refreshPromise: Promise<AuthResponse> | null = null;

const refreshSession = async (): Promise<AuthResponse> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${SESSION_API_URL}/api/auth/browser/refresh`, {
    method: 'POST',
    credentials: 'include'
  }).then(async response => {
    if (!response.ok) {
      if (response.status !== 401) throw new ApiError(response.status, 'request.failed');
      saveSession(null);
      throw new ApiError(401, 'auth.session_expired');
    }
    const refreshed = await response.json() as AuthResponse;
    saveSession(refreshed);
    return refreshed;
  }).finally(() => { refreshPromise = null; });

  return refreshPromise;
};

export const apiRequest = async <T>(baseUrl: string, path: string, init: RequestInit = {}, authenticated = true, retry = true): Promise<T> => {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const token = getStoredSession()?.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      credentials: baseUrl === SESSION_API_URL ? 'include' : init.credentials
    });
  } catch {
    throw new ApiError(0, 'network.unavailable');
  }
  if (response.status === 401 && authenticated && retry) {
    await refreshSession();
    return apiRequest<T>(baseUrl, path, init, authenticated, false);
  }
  if (!response.ok) {
    let problem: ProblemDetails | undefined;
    try { problem = await response.json() as ProblemDetails; } catch { /* empty response */ }
    // Server prose is intentionally retained only as diagnostic metadata. The UI
    // renders a local translation selected from the stable code/status instead.
    throw new ApiError(response.status, problem?.code ?? 'request.failed', problem);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};
