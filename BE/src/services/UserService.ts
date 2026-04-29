import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import type { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";
import { AuthService } from "./AuthService.js";
import { sanitizeInput } from "../utils/sanitize.js";

export class UserService {
  static async getAll() {
    return db.select().from(usersTable);
  }

  static async getById(id: number) {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      const err = new Error("User not found");
      (err as any).statusCode = 404;
      throw err;
    }

    return rows[0]!;
  }

  static async create(dto: CreateUserDto) {
    const now = new Date();

    const created = await db
      .insert(usersTable)
      .values({
        name: sanitizeInput(dto.name) || dto.name, // Sanitize name for XSS protection
        age: dto.age,
        email: dto.email,
        password_hash: await bcrypt.hash(dto.password, 10),
        role: dto.role ?? "user",
        is_email_verified: 0,
        created_at: now,
        updated_at: now,
        last_login_at: null,
      })
      .$returningId();

    const newUserId = created[0]?.id;
    if (newUserId === undefined) {
      const err = new Error("Failed to create user");
      (err as any).statusCode = 500;
      throw err;
    }

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, newUserId))
      .limit(1);

    const newUser = rows[0]!;

    // Fire-and-forget: send verification email (don't block the registration response)
    AuthService.sendEmailVerification(newUser.id, newUser.email, newUser.name).catch((err) =>
      console.error("Failed to send verification email:", err),
    );

    return newUser;
  }

  static async update(id: number, dto: UpdateUserDto) {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (existing.length === 0) {
      const err = new Error("User not found");
      (err as any).statusCode = 404;
      throw err;
    }

    const updateData: Record<string, unknown> = { updated_at: new Date() };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.age !== undefined) updateData.age = dto.age;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.is_email_verified !== undefined)
      updateData.is_email_verified = dto.is_email_verified ? 1 : 0;
    if (dto.last_login_at !== undefined)
      updateData.last_login_at = dto.last_login_at === null ? null : new Date(dto.last_login_at);

    await db.update(usersTable).set(updateData).where(eq(usersTable.id, id));

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return rows[0]!;
  }

  static async delete(id: number): Promise<void> {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (existing.length === 0) {
      const err = new Error("User not found");
      (err as any).statusCode = 404;
      throw err;
    }

    await db.delete(usersTable).where(eq(usersTable.id, id));
  }
}
