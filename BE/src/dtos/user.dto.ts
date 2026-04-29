import { z } from "zod";

const RoleEnum = z.enum(["user", "admin", "moderator"]);

// ─── Create User ──────────────────────────────────────────────────────────────
export const CreateUserDto = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int("Age must be an integer").positive("Age must be a positive integer").optional(),
  email: z
    .email("Invalid email address")
    .refine((email) => {
      const allowed = (process.env.UNIVERSITY_EMAIL_DOMAINS ?? "").split(",").map((d) => d.trim()).filter(Boolean);
      if (allowed.length === 0) return true; // allow if not configured; enforced in production via env.example/docs
      const domain = email.split("@")[1]?.toLowerCase() ?? "";
      return allowed.some((d) => domain === d.toLowerCase());
    }, "Email must be a university email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .refine((p) => /[A-Z]/.test(p), "Password must contain an uppercase letter")
    .refine((p) => /[a-z]/.test(p), "Password must contain a lowercase letter")
    .refine((p) => /[0-9]/.test(p), "Password must contain a number"),
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
