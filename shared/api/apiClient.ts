import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const getCsrfTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const fetchCsrfToken = async () => {
  try {
    await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/csrf-token`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

fetchCsrfToken();

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }

    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      await fetchCsrfToken();
      const csrfToken = getCsrfTokenFromCookie();
      if (error.config && csrfToken) {
        error.config.headers['X-CSRF-Token'] = csrfToken;
        return axios.request(error.config);
      }
    }

    if (error.config?.responseType === 'blob' && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const jsonError = JSON.parse(text);
        const errorMessage = jsonError.message || jsonError.error || error.message;
        return Promise.reject({ message: errorMessage, error: errorMessage });
      } catch {
        // fall through to default error handling
      }
    }

    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject({ message: errorMessage, error: errorMessage });
  }
);

export function extractApiErrorMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    const err = error as {
      message?: string;
      error?: string;
      response?: { data?: { message?: string; error?: string } };
    };

    if (err.message) return err.message;
    if (err.error) return err.error;
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data?.error) return err.response.data.error;
  }

  return '';
}

export default apiClient;
