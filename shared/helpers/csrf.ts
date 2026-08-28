const API_URL = import.meta.env.VITE_API_URL || '/api';

export const fetchCsrfToken = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/csrf-token`, { credentials: 'include' });
    // Token is set as a cookie by the server
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

export const getCsrfToken = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const fetchWithCsrf = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const csrfToken = getCsrfToken();
  const headers = new Headers(options.headers);
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  return fetch(url, { ...options, headers, credentials: 'include' });
};
