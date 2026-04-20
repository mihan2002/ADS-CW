import { z } from "zod";

const RoleEnum = z.enum(["user", "admin", "moderator"]);

// ─── Create User ──────────────────────────────────────────────────────────────
export const CreateUserDto = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int("Age must be an integer").positive("Age must be a positive integer"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: RoleEnum.default("user").optional(),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

// ─── Update User ──────────────────────────────────────────────────────────────
export const UpdateUserDto = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    age: z
      .number()
      .int("Age must be an integer")
      .positive("Age must be a positive integer")
      .optional(),
    email: z.email("Invalid email address").optional(),
    role: RoleEnum.optional(),
    is_email_verified: z.boolean().optional(),
    last_login_at: z.string().datetime().nullable().optional(),
  })
  .strict();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
