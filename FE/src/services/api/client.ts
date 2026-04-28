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
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const method = String(config.method || "get").toUpperCase();

  // Debug logs (do not log the token value)
  console.debug("[api] request", { method, url, hasToken: Boolean(accessToken) });

  if (accessToken) {
    config.headers = config.headers ?? {};
    // Ensure Authorization is always attached when token exists
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const status = error.response?.status;
    console.debug("[api] response error", {
      status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      message: error.message,
      data: error.response?.data,
    });

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
