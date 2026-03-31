import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  alumniProfilesTable,
  degreesTable,
  certificationsTable,
  licensesTable,
  professionalCoursesTable,
  employmentHistoryTable,
  usersTable,
} from "../db/schema.js";
import type {
  CreateOrUpdateProfileDto,
  AddDegreeDto,
  UpdateDegreeDto,
  AddCertificationDto,
  UpdateCertificationDto,
  AddLicenseDto,
  UpdateLicenseDto,
  AddProfessionalCourseDto,
  UpdateProfessionalCourseDto,
  AddEmploymentHistoryDto,
  UpdateEmploymentHistoryDto,
} from "../dtos/alumni.dto.js";

// ─── Helper ───────────────────────────────────────────────────────────────────
function notFound(message: string): never {
  const err = new Error(message);
  (err as any).statusCode = 404;
  throw err;
}

async function assertUserExists(userId: number) {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (rows.length === 0) notFound("User not found");
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export class AlumniService {
  static async getProfile(userId: number) {
    await assertUserExists(userId);

    const profile = await db
      .select()
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId))
      .limit(1);

    const [degrees, certifications, licenses, courses, employmentHistory] =
      await Promise.all([
        db.select().from(degreesTable).where(eq(degreesTable.user_id, userId)),
        db.select().from(certificationsTable).where(eq(certificationsTable.user_id, userId)),
        db.select().from(licensesTable).where(eq(licensesTable.user_id, userId)),
        db.select().from(professionalCoursesTable).where(eq(professionalCoursesTable.user_id, userId)),
        db.select().from(employmentHistoryTable).where(eq(employmentHistoryTable.user_id, userId)),
      ]);

    return {
      profile: profile[0] ?? null,
      degrees,
      certifications,
      licenses,
      professionalCourses: courses,
      employmentHistory,
    };
  }

  static async getAllProfiles() {
    return db.select().from(alumniProfilesTable);
  }

  static async createOrUpdateProfile(userId: number, dto: CreateOrUpdateProfileDto) {
    await assertUserExists(userId);

    const existing = await db
      .select()
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId))
      .limit(1);

    const now = new Date();

    if (existing.length > 0) {
      await db
        .update(alumniProfilesTable)
        .set({ ...dto, updated_at: now })
        .where(eq(alumniProfilesTable.user_id, userId));

      const rows = await db
        .select()
        .from(alumniProfilesTable)
        .where(eq(alumniProfilesTable.user_id, userId))
        .limit(1);

      return { profile: rows[0]!, created: false };
    }

    await db.insert(alumniProfilesTable).values({
      user_id: userId,
      ...dto,
      created_at: now,
      updated_at: now,
    });

    const rows = await db
      .select()
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId))
      .limit(1);

    return { profile: rows[0]!, created: true };
  }

  static async deleteProfile(userId: number): Promise<void> {
    await assertUserExists(userId);

    const existing = await db
      .select()
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId))
      .limit(1);

    if (existing.length === 0) notFound("Alumni profile not found");

    await db
      .delete(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId));
  }

  static async uploadProfileImage(userId: number, file: Express.Multer.File) {
    const profile = await db
      .select()
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId))
      .limit(1);

    if (profile.length === 0) notFound("Alumni profile not found");

    const filePath = `/uploads/profile-images/${file.filename}`;
    return { filename: file.filename, path: filePath, size: file.size };
  }

  // ─── Degrees ────────────────────────────────────────────────────────────────
  static async addDegree(userId: number, dto: AddDegreeDto) {
    const now = new Date();

    const created = await db
      .insert(degreesTable)
      .values({
        user_id: userId,
        title: dto.title,
        institution_name: dto.institution_name,
        official_url: dto.official_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : null,
        created_at: now,
      })
      .$returningId();

    const degreeId = created[0]?.id;
    if (degreeId === undefined) {
      const err = new Error("Failed to add degree");
      (err as any).statusCode = 500;
      throw err;
    }

    const rows = await db
      .select()
      .from(degreesTable)
      .where(eq(degreesTable.id, degreeId))
      .limit(1);

    return rows[0]!;
  }

  static async updateDegree(userId: number, degreeId: number, dto: UpdateDegreeDto) {
    const rows = await db
      .select()
      .from(degreesTable)
      .where(and(eq(degreesTable.id, degreeId), eq(degreesTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Degree not found");

    const existing = rows[0]!;

    await db
      .update(degreesTable)
      .set({
        title: dto.title ?? existing.title,
        institution_name: dto.institution_name ?? existing.institution_name,
        official_url: dto.official_url !== undefined ? dto.official_url : existing.official_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : existing.completed_on,
      })
      .where(eq(degreesTable.id, degreeId));

    const updated = await db
      .select()
      .from(degreesTable)
      .where(eq(degreesTable.id, degreeId))
      .limit(1);

    return updated[0]!;
  }

  static async deleteDegree(userId: number, degreeId: number): Promise<void> {
    const rows = await db
      .select()
      .from(degreesTable)
      .where(and(eq(degreesTable.id, degreeId), eq(degreesTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Degree not found");

    await db.delete(degreesTable).where(eq(degreesTable.id, degreeId));
  }

  // ─── Certifications ──────────────────────────────────────────────────────────
  static async addCertification(userId: number, dto: AddCertificationDto) {
    const now = new Date();

    const created = await db
      .insert(certificationsTable)
      .values({
        user_id: userId,
        name: dto.name,
        provider: dto.provider,
        course_url: dto.course_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : null,
        created_at: now,
      })
      .$returningId();

    const certId = created[0]?.id;
    if (certId === undefined) {
      const err = new Error("Failed to add certification");
      (err as any).statusCode = 500;
      throw err;
    }

    const rows = await db
      .select()
      .from(certificationsTable)
      .where(eq(certificationsTable.id, certId))
      .limit(1);

    return rows[0]!;
  }

  static async updateCertification(userId: number, certId: number, dto: UpdateCertificationDto) {
    const rows = await db
      .select()
      .from(certificationsTable)
      .where(and(eq(certificationsTable.id, certId), eq(certificationsTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Certification not found");

    const existing = rows[0]!;

    await db
      .update(certificationsTable)
      .set({
        name: dto.name ?? existing.name,
        provider: dto.provider ?? existing.provider,
        course_url: dto.course_url !== undefined ? dto.course_url : existing.course_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : existing.completed_on,
      })
      .where(eq(certificationsTable.id, certId));

    const updated = await db
      .select()
      .from(certificationsTable)
      .where(eq(certificationsTable.id, certId))
      .limit(1);

    return updated[0]!;
  }

  static async deleteCertification(userId: number, certId: number): Promise<void> {
    const rows = await db
      .select()
      .from(certificationsTable)
      .where(and(eq(certificationsTable.id, certId), eq(certificationsTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Certification not found");

    await db.delete(certificationsTable).where(eq(certificationsTable.id, certId));
  }

  // ─── Licenses ────────────────────────────────────────────────────────────────
  static async addLicense(userId: number, dto: AddLicenseDto) {
    const now = new Date();

    const created = await db
      .insert(licensesTable)
      .values({
        user_id: userId,
        name: dto.name,
        awarding_body: dto.awarding_body,
        license_url: dto.license_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : null,
        created_at: now,
      })
      .$returningId();

    const licenseId = created[0]?.id;
    if (licenseId === undefined) {
      const err = new Error("Failed to add license");
      (err as any).statusCode = 500;
      throw err;
    }

    const rows = await db
      .select()
      .from(licensesTable)
      .where(eq(licensesTable.id, licenseId))
      .limit(1);

    return rows[0]!;
  }

  static async updateLicense(userId: number, licenseId: number, dto: UpdateLicenseDto) {
    const rows = await db
      .select()
      .from(licensesTable)
      .where(and(eq(licensesTable.id, licenseId), eq(licensesTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("License not found");

    const existing = rows[0]!;

    await db
      .update(licensesTable)
      .set({
        name: dto.name ?? existing.name,
        awarding_body: dto.awarding_body ?? existing.awarding_body,
        license_url: dto.license_url !== undefined ? dto.license_url : existing.license_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : existing.completed_on,
      })
      .where(eq(licensesTable.id, licenseId));

    const updated = await db
      .select()
      .from(licensesTable)
      .where(eq(licensesTable.id, licenseId))
      .limit(1);

    return updated[0]!;
  }

  static async deleteLicense(userId: number, licenseId: number): Promise<void> {
    const rows = await db
      .select()
      .from(licensesTable)
      .where(and(eq(licensesTable.id, licenseId), eq(licensesTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("License not found");

    await db.delete(licensesTable).where(eq(licensesTable.id, licenseId));
  }

  // ─── Professional Courses ────────────────────────────────────────────────────
  static async addProfessionalCourse(userId: number, dto: AddProfessionalCourseDto) {
    const now = new Date();

    const created = await db
      .insert(professionalCoursesTable)
      .values({
        user_id: userId,
        title: dto.title,
        provider: dto.provider,
        course_url: dto.course_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : null,
        created_at: now,
      })
      .$returningId();

    const courseId = created[0]?.id;
    if (courseId === undefined) {
      const err = new Error("Failed to add professional course");
      (err as any).statusCode = 500;
      throw err;
    }

    const rows = await db
      .select()
      .from(professionalCoursesTable)
      .where(eq(professionalCoursesTable.id, courseId))
      .limit(1);

    return rows[0]!;
  }

  static async updateProfessionalCourse(userId: number, courseId: number, dto: UpdateProfessionalCourseDto) {
    const rows = await db
      .select()
      .from(professionalCoursesTable)
      .where(and(eq(professionalCoursesTable.id, courseId), eq(professionalCoursesTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Professional course not found");

    const existing = rows[0]!;

    await db
      .update(professionalCoursesTable)
      .set({
        title: dto.title ?? existing.title,
        provider: dto.provider ?? existing.provider,
        course_url: dto.course_url !== undefined ? dto.course_url : existing.course_url,
        completed_on: dto.completed_on ? new Date(dto.completed_on) : existing.completed_on,
      })
      .where(eq(professionalCoursesTable.id, courseId));

    const updated = await db
      .select()
      .from(professionalCoursesTable)
      .where(eq(professionalCoursesTable.id, courseId))
      .limit(1);

    return updated[0]!;
  }

  static async deleteProfessionalCourse(userId: number, courseId: number): Promise<void> {
    const rows = await db
      .select()
      .from(professionalCoursesTable)
      .where(and(eq(professionalCoursesTable.id, courseId), eq(professionalCoursesTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Professional course not found");

    await db.delete(professionalCoursesTable).where(eq(professionalCoursesTable.id, courseId));
  }

  // ─── Employment History ──────────────────────────────────────────────────────
  static async addEmploymentHistory(userId: number, dto: AddEmploymentHistoryDto) {
    const now = new Date();

    const created = await db
      .insert(employmentHistoryTable)
      .values({
        user_id: userId,
        company: dto.company,
        job_title: dto.job_title,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        description: dto.description,
        created_at: now,
        updated_at: now,
      })
      .$returningId();

    const employmentId = created[0]?.id;
    if (employmentId === undefined) {
      const err = new Error("Failed to add employment history");
      (err as any).statusCode = 500;
      throw err;
    }

    const rows = await db
      .select()
      .from(employmentHistoryTable)
      .where(eq(employmentHistoryTable.id, employmentId))
      .limit(1);

    return rows[0]!;
  }

  static async updateEmploymentHistory(
    userId: number,
    employmentId: number,
    dto: UpdateEmploymentHistoryDto,
  ) {
    const rows = await db
      .select()
      .from(employmentHistoryTable)
      .where(
        and(
          eq(employmentHistoryTable.id, employmentId),
          eq(employmentHistoryTable.user_id, userId),
        ),
      )
      .limit(1);

    if (rows.length === 0) notFound("Employment history not found");

    const existing = rows[0]!;
    const now = new Date();

    await db
      .update(employmentHistoryTable)
      .set({
        company: dto.company ?? existing.company,
        job_title: dto.job_title ?? existing.job_title,
        start_date: dto.start_date ? new Date(dto.start_date) : existing.start_date,
        end_date:
          dto.end_date !== undefined
            ? dto.end_date === null
              ? null
              : new Date(dto.end_date)
            : existing.end_date,
        description: dto.description !== undefined ? dto.description : existing.description,
        updated_at: now,
      })
      .where(eq(employmentHistoryTable.id, employmentId));

    const updated = await db
      .select()
      .from(employmentHistoryTable)
      .where(eq(employmentHistoryTable.id, employmentId))
      .limit(1);

    return updated[0]!;
  }

  static async deleteEmploymentHistory(userId: number, employmentId: number): Promise<void> {
    const rows = await db
      .select()
      .from(employmentHistoryTable)
      .where(
        and(
          eq(employmentHistoryTable.id, employmentId),
          eq(employmentHistoryTable.user_id, userId),
        ),
      )
      .limit(1);

    if (rows.length === 0) notFound("Employment history not found");

    await db.delete(employmentHistoryTable).where(eq(employmentHistoryTable.id, employmentId));
  }
}
