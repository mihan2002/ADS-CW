import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../../utils/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(newToken: string | null) {
  pendingQueue.forEach((resolver) => resolver(newToken));
  pendingQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    if (!originalRequest || originalRequest._retry || error.response?.status !== 401) {
      throw error;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw error;
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => {
        pendingQueue.push(resolve);
      });
      if (!token) {
        throw error;
      }
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    }

    isRefreshing = true;
    try {
      const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
      const payload = refreshResponse.data?.data as { accessToken: string; refreshToken: string };
      setTokens(payload.accessToken, payload.refreshToken);
      flushQueue(payload.accessToken);
      originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      flushQueue(null);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  },
);
