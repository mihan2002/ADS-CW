import { apiClient } from "./client";
import type { ApiResponse, AuthUser, LoginPayload } from "../../types/api";

export interface RegisterInput {
  name: string;
  age: number;
  email: string;
  password: string;
}

export async function login(email: string, password: string) {
  const response = await apiClient.post<ApiResponse<LoginPayload>>("/api/auth/login", { email, password });
  return response.data.data;
}

export async function register(payload: RegisterInput) {
  const response = await apiClient.post<ApiResponse<AuthUser>>("/api/users", payload);
  return response.data.data;
}

export async function verifyEmail(email: string, token: string) {
  return apiClient.post("/api/auth/verify-email", { email, token });
}

export async function resendVerification(email: string) {
  return apiClient.post("/api/auth/resend-verification", { email });
}

export async function requestPasswordReset(email: string) {
  return apiClient.post("/api/auth/request-password-reset", { email });
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  return apiClient.post("/api/auth/reset-password", { email, token, newPassword });
}

export async function verifyAccessToken() {
  const response = await apiClient.get<ApiResponse<{ userId: number; email: string; name: string; role: string }>>(
    "/api/auth/verify",
  );
  return response.data.data;
}
