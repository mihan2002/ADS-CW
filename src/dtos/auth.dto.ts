import { z } from "zod";

// ─── Login ────────────────────────────────────────────────────────────────────
export const LoginDto = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginDto = z.infer<typeof LoginDto>;

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

// ─── Request Password Reset ───────────────────────────────────────────────────
export const RequestPasswordResetDto = z.object({
  email: z.email("Invalid email address"),
});
export type RequestPasswordResetDto = z.infer<typeof RequestPasswordResetDto>;

// ─── Reset Password ───────────────────────────────────────────────────────────
export const ResetPasswordDto = z.object({
  email: z.email("Invalid email address"),
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const VerifyEmailDto = z.object({
  email: z.email("Invalid email address"),
  token: z.string().length(6, "Token must be exactly 6 digits").regex(/^\d{6}$/, "Token must be a 6-digit number"),
});
export type VerifyEmailDto = z.infer<typeof VerifyEmailDto>;
