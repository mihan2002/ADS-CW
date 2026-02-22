import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import bcrypt from "bcrypt";

export class UserController {
	static async getAll(req: Request, res: Response): Promise<void> {
		try {
			const users = await db.select().from(usersTable);

			res.status(200).json({
				success: true,
				data: users,
				message: "Users retrieved successfully",
			});
		} catch (error) {
			console.error("Error fetching users:", error);
			res.status(500).json({
				success: false,
				message: "Failed to retrieve users",
			});
		}
	}

	static async getById(req: Request, res: Response): Promise<void> {
		try {
			const id = Number(req.params.id);

			if (!Number.isInteger(id) || id <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			const user = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.id, id))
				.limit(1);

			if (user.length === 0) {
				res.status(404).json({
					success: false,
					message: "User not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: user[0],
				message: "User retrieved successfully",
			});
		} catch (error) {
			console.error("Error fetching user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to retrieve user",
			});
		}
	}

	static async create(req: Request, res: Response): Promise<void> {
		try {
      
			const { name, age, email, password } = req.body;
			console.log("🚀 ~ UserController ~ create ~ req.body:", req.body)

			if (!name || !email || !password || age === undefined) {
				res.status(400).json({
					success: false,
					message: "name, age, email and password are required",
				});
				return;
			}

			const parsedAge = Number(age);
			if (!Number.isInteger(parsedAge) || parsedAge <= 0) {
				res.status(400).json({
					success: false,
					message: "age must be a positive integer",
				});
				return;
			}

			const now = new Date();

			const created = await db
				.insert(usersTable)
				.values({
					name,
					age: parsedAge,
					email,
					password_hash: await bcrypt.hash(password, 10),
					is_email_verified: 0,
					created_at: now,
					updated_at: now,
					last_login_at: null,
				})
				.$returningId();

			const newUserId = created[0]?.id;

			if (newUserId === undefined) {
				res.status(500).json({
					success: false,
					message: "Failed to create user",
				});
				return;
			}

			const user = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.id, newUserId))
				.limit(1);

			res.status(201).json({
				success: true,
				data: user[0],
				message: "User created successfully",
			});
		} catch (error) {
			console.error("Error creating user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to create user",
			});
		}
	}

	static async update(req: Request, res: Response): Promise<void> {
		try {
			const id = Number(req.params.id);

			if (!Number.isInteger(id) || id <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			const { name, age, email, is_email_verified, last_login_at } =
				req.body;

			const existingUser = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.id, id))
				.limit(1);

			if (existingUser.length === 0) {
				res.status(404).json({
					success: false,
					message: "User not found",
				});
				return;
			}

			const updateData: {
				name?: string;
				age?: number;
				email?: string;
				is_email_verified?: number;
				updated_at: Date;
				last_login_at?: Date | null;
			} = {
				updated_at: new Date(),
			};

			if (name !== undefined) {
				updateData.name = name;
			}

			if (age !== undefined) {
				const parsedAge = Number(age);
				if (!Number.isInteger(parsedAge) || parsedAge <= 0) {
					res.status(400).json({
						success: false,
						message: "age must be a positive integer",
					});
					return;
				}
				updateData.age = parsedAge;
			}

			if (email !== undefined) {
				updateData.email = email;
			}


			if (is_email_verified !== undefined) {
				updateData.is_email_verified = Number(is_email_verified) ? 1 : 0;
			}

			if (last_login_at !== undefined) {
				updateData.last_login_at =
					last_login_at === null ? null : new Date(last_login_at);
			}

			await db.update(usersTable).set(updateData).where(eq(usersTable.id, id));

			const updatedUser = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.id, id))
				.limit(1);

			res.status(200).json({
				success: true,
				data: updatedUser[0],
				message: "User updated successfully",
			});
		} catch (error) {
			console.error("Error updating user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update user",
			});
		}
	}

	static async delete(req: Request, res: Response): Promise<void> {
		try {
			const id = Number(req.params.id);

			if (!Number.isInteger(id) || id <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			const existingUser = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.id, id))
				.limit(1);

			if (existingUser.length === 0) {
				res.status(404).json({
					success: false,
					message: "User not found",
				});
				return;
			}

			await db.delete(usersTable).where(eq(usersTable.id, id));

			res.status(200).json({
				success: true,
				message: "User deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete user",
			});
		}
	}
}
