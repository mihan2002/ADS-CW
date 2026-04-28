import type { Request, Response } from "express";
import { ZodError } from "zod";
import { UserService } from "../services/UserService.js";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";

function parseIntId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function stripPasswordHash(user: any) {
  if (!user) return user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _passwordHash, ...safe } = user;
  return safe;
}

export class UserController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAll();
      res.status(200).json({ success: true, data: users, message: "Users retrieved successfully" });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve users" });
    }
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const user = await UserService.getById(req.auth.userId);
      res.status(200).json({ success: true, data: stripPasswordHash(user), message: "User retrieved successfully" });
    } catch (error) {
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIntId(req.params.id!);
      if (!id) {
        res.status(400).json({ success: false, message: "Valid user ID is required" });
        return;
      }
      const user = await UserService.getById(id);
      res.status(200).json({ success: true, data: stripPasswordHash(user), message: "User retrieved successfully" });
    } catch (error) {
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = CreateUserDto.parse(req.body);
      const user = await UserService.create(dto);
      res.status(201).json({ success: true, data: user, message: "User created successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      console.error("Error creating user:", error);
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIntId(req.params.id!);
      if (!id) {
        res.status(400).json({ success: false, message: "Valid user ID is required" });
        return;
      }
      const dto = UpdateUserDto.parse(req.body);
      const user = await UserService.update(id, dto);
      res.status(200).json({ success: true, data: user, message: "User updated successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        return;
      }
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIntId(req.params.id!);
      if (!id) {
        res.status(400).json({ success: false, message: "Valid user ID is required" });
        return;
      }
      await UserService.delete(id);
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      const status = (error as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }
}
