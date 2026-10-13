import axios from 'axios';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5093/api';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized with Refresh Token mechanism
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (typeof window !== 'undefined' && error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || '';
      
      // Do not attempt refresh for login, register, or refresh endpoints
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/refresh')) {
        originalRequest._retry = true;
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedToken = localStorage.getItem('token');

        if (storedRefreshToken) {
          try {
            const refreshRes = await axios.post(`${baseURL}/auth/refresh`, {
              token: storedToken || '',
              refreshToken: storedRefreshToken,
            });

            const { token: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data;

            if (newAccessToken) {
              localStorage.setItem('token', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }

              // Update headers and retry failed request
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            }
          } catch (refreshErr) {
            console.warn('Session extension failed; refresh token expired or invalid.');
          }
        }

        // If refresh failed or no refresh token exists, clear session and redirect to /login
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=1';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
