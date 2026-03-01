import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/index.js';
import { usersTable, passwordResetTokensTable } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { JWTUtils } from '../utils/jwt.js';
import { sendEmail } from '../config/emailConfig.js';
import crypto from 'crypto';

export class AuthController {
  /**
   * User login endpoint
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      // Find user by email
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const user = users[0]!;

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Update last login timestamp
      await db
        .update(usersTable)
        .set({ last_login_at: new Date() })
        .where(eq(usersTable.id, user.id));

      // Generate JWT tokens
      const tokens = JWTUtils.generateTokens({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Return success response with tokens and user info
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
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
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
      });
    }
  }

  /**
   * User logout endpoint
   * Note: Since JWT is stateless, logout is primarily handled client-side
   * by removing tokens. This endpoint can be used for logging or token blacklisting.
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a production app, you might want to:
      // 1. Blacklist the token in Redis/database
      // 2. Log the logout event
      // 3. Clear any server-side session data

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      // Verify refresh token
      let payload;
      try {
        payload = JWTUtils.verifyRefreshToken(refreshToken);
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
        return;
      }

      // Verify user still exists
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, payload.userId))
        .limit(1);

      if (users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const user = users[0]!;

      // Generate new tokens
      const tokens = JWTUtils.generateTokens({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh',
      });
    }
  }

  /**
   * Verify token endpoint - useful for checking if a token is valid
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No token provided',
        });
        return;
      }

      const token = authHeader.substring(7);

      try {
        const payload = JWTUtils.verifyAccessToken(token);
        res.status(200).json({
          success: true,
          message: 'Token is valid',
          data: {
            userId: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role,
          },
        });
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token verification',
      });
    }
  }

  /**
   * Request password reset - sends email with reset token
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      // Find user by email
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      // Always return success to prevent email enumeration
      if (users.length === 0) {
        res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
        return;
      }

      const user = users[0]!;

      // Generate 6-digit reset token
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenHash = await bcrypt.hash(resetToken, 10);

      // Store token in database (expires in 1 hour)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await db.insert(passwordResetTokensTable).values({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: new Date(),
      });

      // Send reset email
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

      await sendEmail(email, 'Password Reset Request', emailHtml);

      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset request',
      });
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, token, newPassword } = req.body;

      // Validate input
      if (!email || !token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Email, token, and new password are required',
        });
        return;
      }

      // Validate password strength
      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
        });
        return;
      }

      // Find user by email
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (users.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid email',
        });
        return;
      }

      const user = users[0]!;
      console.log("🚀 ~ AuthController ~ resetPassword ~ user:", user)

      // Get all unused tokens for this user
      const resetTokens = await db
        .select()
        .from(passwordResetTokensTable)
        .where(
          and(
            eq(passwordResetTokensTable.user_id, user.id)
          )
        );
      console.log("🚀 ~ AuthController ~ resetPassword ~ resetTokens:", resetTokens)

      if (resetTokens.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
        return;
      }

      // Find matching token and check expiry
      let validToken = null;
      for (const dbToken of resetTokens) {
        const isMatch = await bcrypt.compare(token, dbToken.token_hash);
        if (isMatch) {
          if (new Date() > new Date(dbToken.expires_at)) {
            res.status(400).json({
              success: false,
              message: 'Reset token has expired',
            });
            return;
          }
          validToken = dbToken;
          break;
        }
      }

      if (!validToken) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update user's password
      await db
        .update(usersTable)
        .set({ 
          password_hash: newPasswordHash,
          updated_at: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      // Mark token as used
      await db
        .update(passwordResetTokensTable)
        .set({ used_at: new Date() })
        .where(eq(passwordResetTokensTable.id, validToken.id));

      // Send confirmation email
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

      await sendEmail(email, 'Password Reset Successful', confirmationEmailHtml);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset',
      });
    }
  }
}
