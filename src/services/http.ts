import axios, { AxiosError } from 'axios';

export const http = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

http.interceptors.request.use((config) => {
  // Attach auth token if available (read-only; storage remains in auth service)
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // TODO: trigger refresh flow or logout via an event bus
      // console.warn('Unauthorized. Consider refreshing token or redirecting to login.');
    }
    return Promise.reject(error);
  }
);

export default http;