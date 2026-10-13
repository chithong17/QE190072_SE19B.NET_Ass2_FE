import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const AUTH_SESSION_EVENT = 'auth-session-changed';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5093/api';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (unknownError: unknown) => {
    const error = unknownError as AxiosError;
    const originalRequest = error.config as RetryableRequest | undefined;
    if (typeof window === 'undefined' || error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? '';
    if (['/auth/login', '/auth/register', '/auth/refresh'].some((path) => url.includes(path))) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          token: localStorage.getItem('token') ?? '',
          refreshToken,
        });
        const newAccessToken = response.data.token as string | undefined;
        const newRefreshToken = response.data.refreshToken as string | undefined;
        if (newAccessToken) {
          localStorage.setItem('token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Continue to the common expiry path.
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-session-expired'));
    return Promise.reject(error);
  }
);

export default api;
