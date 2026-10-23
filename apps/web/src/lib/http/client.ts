const TOKEN_KEY = 'bodepos_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function baseUrl() {
  const url = import.meta.env.VITE_API_BASE_URL as string;
  if (!url) throw new Error('VITE_API_BASE_URL missing');
  return url.replace(/\/+$/, '');
}

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => undefined);
  if (!res.ok) {
    const msg = (body as { error?: { message?: string } })?.error?.message ?? res.statusText;
    if (res.status === 401 && token && !path.includes('/auth/login')) {
      setToken(null);
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?sesion=expirada&next=${next}`);
    }
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}
