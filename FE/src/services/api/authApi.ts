import api from './axiosInstance';
import type { LoginRequest, RegisterRequest, LoginResponse, TokenResponse, ApiResponse } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<unknown>>('/users', {
      name: data.name,
      age: data.age,
      email: data.email,
      password_hash: data.password,
    }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh', { refreshToken }),

  verifyToken: () =>
    api.get<ApiResponse<{ userId: number; email: string; name: string }>>('/auth/verify'),

  verifyEmail: (email: string, token: string) =>
    api.post<ApiResponse<null>>('/auth/verify-email', { email, token }),

  resendVerification: (email: string) =>
    api.post<ApiResponse<null>>('/auth/resend-verification', { email }),

  requestPasswordReset: (email: string) =>
    api.post<ApiResponse<null>>('/auth/request-password-reset', { email }),

  resetPassword: (email: string, token: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { email, token, newPassword }),
};
