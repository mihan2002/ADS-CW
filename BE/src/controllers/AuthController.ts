import type { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthService } from "../services/AuthService.js";
import {
  LoginDto,
  RefreshTokenDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from "../dtos/auth.dto.js";

export class AuthController {
  /**
   * User login endpoint
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = LoginDto.parse(req.body);
      const result = await AuthService.login(dto);
      res.status(200).json({ success: true, message: "Login successful", data: result });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * User logout endpoint
   */
  static async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: "Logout successful" });
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const dto = RefreshTokenDto.parse(req.body);
      const tokens = await AuthService.refreshToken(dto);
      res.status(200).json({ success: true, message: "Token refreshed successfully", data: tokens });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * Verify token endpoint
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "No token provided" });
        return;
      }
      const token = authHeader.substring(7);
      const payload = AuthService.verifyToken(token);
      res.status(200).json({ success: true, message: "Token is valid", data: payload });
    } catch (error) {
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const dto = RequestPasswordResetDto.parse(req.body);
      await AuthService.requestPasswordReset(dto);
      res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      console.error("Password reset request error:", error);
      res.status(500).json({ success: false, message: "Internal server error during password reset request" });
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const dto = ResetPasswordDto.parse(req.body);
      await AuthService.resetPassword(dto);
      res.status(200).json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * Verify email with OTP token
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    console.log("[DEBUG] verifyEmail controller called");
    console.log("[DEBUG] Request body:", JSON.stringify(req.body, null, 2));
    console.log("[DEBUG] Request headers:", JSON.stringify(req.headers, null, 2));
    try {
      console.log("[DEBUG] Parsing DTO...");
      const dto = VerifyEmailDto.parse(req.body);
      console.log("[DEBUG] DTO parsed successfully:", JSON.stringify(dto, null, 2));
      
      console.log("[DEBUG] Calling AuthService.verifyEmail...");
      await AuthService.verifyEmail(dto);
      console.log("[DEBUG] AuthService.verifyEmail completed successfully");
      
      res.status(200).json({ success: true, message: "Email verified successfully" });
      console.log("[DEBUG] Response sent: 200 OK");
    } catch (error) {
      console.error("[DEBUG] Error caught in verifyEmail controller:", error);
      if (error instanceof ZodError) {
        console.error("[DEBUG] Zod validation error:", JSON.stringify(error.issues, null, 2));
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      const status = (error as any).statusCode ?? 500;
      console.error("[DEBUG] Sending error response with status:", status);
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * Resend email verification OTP
   */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const dto = ResendVerificationDto.parse(req.body);
      await AuthService.resendEmailVerification(dto.email);
      res.status(200).json({
        success: true,
        message: "If your email exists and is unverified, a new verification code has been sent",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }
}
