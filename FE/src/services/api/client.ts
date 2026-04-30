import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../../utils/tokenStorage";
import { getStoredCsrfToken, setCsrfToken, clearCsrfToken } from "../../utils/csrfToken";
import { ForbiddenError } from "../../utils/errorHandler";
import type { ApiResponse } from "../../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Important for CSRF cookies
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(newToken: string | null) {
  pendingQueue.forEach((resolver) => resolver(newToken));
  pendingQueue = [];
}

apiClient.interceptors.request.use(async (config) => {
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

  // Add CSRF token for mutation requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    let csrfToken = getStoredCsrfToken();
    
    // If no token, fetch it first (but avoid infinite loop on the csrf endpoint itself)
    if (!csrfToken && !url.includes("/csrf")) {
      try {
        csrfToken = await fetchCsrfToken();
      } catch (err) {
        console.error("[api] Failed to fetch CSRF token:", err);
      }
    }
    
    if (csrfToken) {
      config.headers = config.headers ?? {};
      (config.headers as any)["X-CSRF-Token"] = csrfToken;
      console.debug("[api] Added CSRF token to request");
    }
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

    // Handle 403 Forbidden errors
    if (status === 403) {
      throw new ForbiddenError();
    }

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

// Fetch CSRF token from backend
async function fetchCsrfToken(): Promise<string | null> {
  try {
    // Use a separate axios instance to avoid interceptor recursion
    const response = await axios.get<ApiResponse<{ csrfToken: string }>>(
      `${API_BASE_URL}/api/api-keys/csrf`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      }
    );
    const token = response.data.data.csrfToken;
    setCsrfToken(token);
    console.debug("[api] CSRF token fetched and stored");
    return token;
  } catch (err) {
    console.error("[api] Failed to fetch CSRF token:", err);
    return null;
  }
}

// Export function to manually fetch CSRF token if needed
export async function ensureCsrfToken(): Promise<string | null> {
  const existing = getStoredCsrfToken();
  if (existing) return existing;
  return fetchCsrfToken();
}

// Clear CSRF token on logout
export function clearAuthData(): void {
  clearTokens();
  clearCsrfToken();
}
