import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable, passwordResetTokensTable, emailVerificationTokensTable } from "../db/schema.js";
import { JWTUtils } from "../utils/jwt.js";
import { sendEmail } from "../config/emailConfig.js";
import type {
  LoginDto,
  RefreshTokenDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "../dtos/auth.dto.js";

export interface LoginResult {
  user: {
    id: number;
    name: string;
    email: string;
    age: number | null;
    role: string;
    is_email_verified: number;
    last_login_at: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export class AuthService {
  static async login(dto: LoginDto): Promise<LoginResult> {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (users.length === 0) {
      const err = new Error("Invalid email or password");
      (err as any).statusCode = 401;
      throw err;
    }

    const user = users[0]!;

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      const err = new Error("Invalid email or password");
      (err as any).statusCode = 401;
      throw err;
    }

    await db
      .update(usersTable)
      .set({ last_login_at: new Date() })
      .where(eq(usersTable.id, user.id));

    const tokens = JWTUtils.generateTokens({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        is_email_verified: user.is_email_verified,
        last_login_at: new Date(),
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  static async refreshToken(dto: RefreshTokenDto): Promise<TokenPair> {
    let payload: TokenPayload;
    try {
      payload = JWTUtils.verifyRefreshToken(dto.refreshToken) as TokenPayload;
    } catch {
      const err = new Error("Invalid or expired refresh token");
      (err as any).statusCode = 401;
      throw err;
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (users.length === 0) {
      const err = new Error("User not found");
      (err as any).statusCode = 401;
      throw err;
    }

    const user = users[0]!;
    const tokens = JWTUtils.generateTokens({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return JWTUtils.verifyAccessToken(token) as TokenPayload;
    } catch {
      const err = new Error("Invalid or expired token");
      (err as any).statusCode = 401;
      throw err;
    }
  }

  static async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    // Silently return if user not found (prevents email enumeration)
    if (users.length === 0) return;

    const user = users[0]!;

    const resetToken = crypto.randomInt(100000, 1000000).toString(); // 6-digit
    const tokenHash = await bcrypt.hash(resetToken, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.insert(passwordResetTokensTable).values({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .token-box {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
            word-break: break-all;
            margin: 20px 0;
            border: 1px solid #ddd;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Use the following token to reset it:</p>
          <div class="token-box">${resetToken}</div>
          <p>This token will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(dto.email, "Password Reset Request", emailHtml);
  }

  static async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (users.length === 0) {
      const err = new Error("Invalid email");
      (err as any).statusCode = 400;
      throw err;
    }

    const user = users[0]!;

    const resetTokens = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.user_id, user.id),
          eq(passwordResetTokensTable.used_at, null as any),
        ),
      );

    if (resetTokens.length === 0) {
      const err = new Error("Invalid or expired reset token");
      (err as any).statusCode = 400;
      throw err;
    }

    let validToken = null;
    for (const dbToken of resetTokens) {
      const isMatch = await bcrypt.compare(dto.token, dbToken.token_hash);
      if (isMatch) {
        if (new Date() > new Date(dbToken.expires_at)) {
          const err = new Error("Reset token has expired");
          (err as any).statusCode = 400;
          throw err;
        }
        validToken = dbToken;
        break;
      }
    }

    if (!validToken) {
      const err = new Error("Invalid or expired reset token");
      (err as any).statusCode = 400;
      throw err;
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await db
      .update(usersTable)
      .set({ password_hash: newPasswordHash, updated_at: new Date() })
      .where(eq(usersTable.id, user.id));

    await db
      .update(passwordResetTokensTable)
      .set({ used_at: new Date() })
      .where(eq(passwordResetTokensTable.id, validToken.id));

    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Successful</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you did not make this change, please contact support immediately.</p>
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(dto.email, "Password Reset Successful", confirmationEmailHtml);
  }

  // ─── Email Verification ───────────────────────────────────────────────────────

  /**
   * Generates a 6-digit OTP, stores a bcrypt hash in emailVerificationTokensTable
   * (expires in 1 hour), and emails the plain OTP to the user.
   * Called automatically by UserService.create() after registration.
   */
  static async sendEmailVerification(userId: number, userEmail: string, userName: string): Promise<void> {
    // Invalidate any existing pending tokens for this user
    await db
      .delete(emailVerificationTokensTable)
      .where(eq(emailVerificationTokensTable.user_id, userId));

    const otp = crypto.randomInt(100000, 1000000).toString(); // 6-digit
    const tokenHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.insert(emailVerificationTokensTable).values({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp-box {
            background-color: #f0f4ff;
            padding: 20px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 8px;
            color: #4f46e5;
            margin: 24px 0;
            border: 2px solid #c7d2fe;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify Your Email Address</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for registering! Please verify your email address using the code below:</p>
          <div class="otp-box">${otp}</div>
          <p>This code expires in <strong>1 hour</strong>.</p>
          <p>If you did not create an account, you can safely ignore this email.</p>
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(userEmail, "Verify Your Email Address", emailHtml);
  }

  /**
   * Validates the 6-digit OTP against the stored hash.
   * On success: marks used_at, sets is_email_verified = 1 on the user.
   */
  static async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    // 1. Find the user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (users.length === 0) {
      const err = new Error("Invalid email or token");
      (err as any).statusCode = 400;
      throw err;
    }

    const user = users[0]!;

    // 2. Already verified?
    if (user.is_email_verified === 1) {
      const err = new Error("Email is already verified");
      (err as any).statusCode = 409;
      throw err;
    }

    // 3. Fetch all pending tokens for this user
    const tokens = await db
      .select()
      .from(emailVerificationTokensTable)
      .where(
        and(
          eq(emailVerificationTokensTable.user_id, user.id),
          eq(emailVerificationTokensTable.used_at, null as any),
        ),
      );

    if (tokens.length === 0) {
      const err = new Error("No pending verification token found. Please request a new one.");
      (err as any).statusCode = 400;
      throw err;
    }

    // 4. Find a matching, non-expired token
    let validToken = null;
    for (const dbToken of tokens) {
      const isMatch = await bcrypt.compare(dto.token, dbToken.token_hash);
      if (isMatch) {
        if (new Date() > new Date(dbToken.expires_at)) {
          const err = new Error("Verification token has expired. Please request a new one.");
          (err as any).statusCode = 400;
          throw err;
        }
        validToken = dbToken;
        break;
      }
    }

    if (!validToken) {
      const err = new Error("Invalid verification token");
      (err as any).statusCode = 400;
      throw err;
    }

    // 5. Mark token as used
    await db
      .update(emailVerificationTokensTable)
      .set({ used_at: new Date() })
      .where(eq(emailVerificationTokensTable.id, validToken.id));

    // 6. Mark user as verified
    await db
      .update(usersTable)
      .set({ is_email_verified: 1, updated_at: new Date() })
      .where(eq(usersTable.id, user.id));
  }

  /**
   * Resends the verification OTP. Silently succeeds even if email not found
   * to prevent user enumeration.
   */
  static async resendEmailVerification(email: string): Promise<void> {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (users.length === 0) return; // Silent — prevents enumeration

    const user = users[0]!;

    if (user.is_email_verified === 1) {
      const err = new Error("Email is already verified");
      (err as any).statusCode = 409;
      throw err;
    }

    await AuthService.sendEmailVerification(user.id, user.email, user.name);
  }
}
