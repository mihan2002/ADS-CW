import { z } from "zod";

// ─── Alumni Profile ───────────────────────────────────────────────────────────
export const CreateOrUpdateProfileDto = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  graduation_year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 10)
    .optional(),
  degree: z.string().optional(),
  current_position: z.string().optional(),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});
export type CreateOrUpdateProfileDto = z.infer<typeof CreateOrUpdateProfileDto>;

// ─── Degree ───────────────────────────────────────────────────────────────────
const optionalDateStr = z
  .union([z.string().datetime({ offset: true }), z.string().date()])
  .optional();

export const AddDegreeDto = z.object({
  title: z.string().min(1, "Title is required"),
  institution_name: z.string().min(1, "Institution name is required"),
  official_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  completed_on: optionalDateStr,
});
export type AddDegreeDto = z.infer<typeof AddDegreeDto>;

export const UpdateDegreeDto = AddDegreeDto.partial();
export type UpdateDegreeDto = z.infer<typeof UpdateDegreeDto>;

// ─── Certification ────────────────────────────────────────────────────────────
export const AddCertificationDto = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  course_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  completed_on: optionalDateStr,
});
export type AddCertificationDto = z.infer<typeof AddCertificationDto>;

export const UpdateCertificationDto = AddCertificationDto.partial();
export type UpdateCertificationDto = z.infer<typeof UpdateCertificationDto>;

// ─── License ──────────────────────────────────────────────────────────────────
export const AddLicenseDto = z.object({
  name: z.string().min(1, "Name is required"),
  awarding_body: z.string().min(1, "Awarding body is required"),
  license_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  completed_on: optionalDateStr,
});
export type AddLicenseDto = z.infer<typeof AddLicenseDto>;

export const UpdateLicenseDto = AddLicenseDto.partial();
export type UpdateLicenseDto = z.infer<typeof UpdateLicenseDto>;

// ─── Professional Course ──────────────────────────────────────────────────────
export const AddProfessionalCourseDto = z.object({
  title: z.string().min(1, "Title is required"),
  provider: z.string().min(1, "Provider is required"),
  course_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  completed_on: optionalDateStr,
});
export type AddProfessionalCourseDto = z.infer<typeof AddProfessionalCourseDto>;

export const UpdateProfessionalCourseDto = AddProfessionalCourseDto.partial();
export type UpdateProfessionalCourseDto = z.infer<typeof UpdateProfessionalCourseDto>;

// ─── Employment History ───────────────────────────────────────────────────────
const requiredDateStr = z.union([
  z.string().datetime({ offset: true }),
  z.string().date(),
]);

export const AddEmploymentHistoryDto = z.object({
  company: z.string().min(1, "Company is required"),
  job_title: z.string().min(1, "Job title is required"),
  start_date: requiredDateStr,
  end_date: z
    .union([z.string().datetime({ offset: true }), z.string().date()])
    .nullable()
    .optional(),
  description: z.string().optional(),
});
export type AddEmploymentHistoryDto = z.infer<typeof AddEmploymentHistoryDto>;

export const UpdateEmploymentHistoryDto = AddEmploymentHistoryDto.partial();
export type UpdateEmploymentHistoryDto = z.infer<typeof UpdateEmploymentHistoryDto>;

// ─── Bid ──────────────────────────────────────────────────────────────────────
export const PlaceBidDto = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
});
export type PlaceBidDto = z.infer<typeof PlaceBidDto>;

export const UpdateBidDto = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
});
export type UpdateBidDto = z.infer<typeof UpdateBidDto>;
