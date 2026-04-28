import { eq, and, desc, gte, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  alumniProfilesTable,
  degreesTable,
  certificationsTable,
  licensesTable,
  professionalCoursesTable,
  employmentHistoryTable,
  usersTable,
  bidsTable,
  featureDaysTable,
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
  PlaceBidDto,
  UpdateBidDto,
} from "../dtos/alumni.dto.js";

// ─── Constants ────────────────────────────────────────────────────────────────
/** Max number of times a user can win the featured-alumni slot per calendar month. */
const MONTHLY_APPEARANCE_LIMIT = 3;

// ─── Helper ───────────────────────────────────────────────────────────────────
function notFound(message: string): never {
  const err = new Error(message);
  (err as any).statusCode = 404;
  throw err;
}

/** Format a Date as YYYY-MM-DD string (for human-readable response fields). */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Return a Date set to midnight (00:00:00.000) in local time. */
function midnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function tomorrowMidnight(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return midnight(d);
}

function todayMidnight(): Date {
  return midnight(new Date());
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

    const profileData: Record<string, unknown> = {
      ...dto,
      graduation_date: dto.graduation_date ? new Date(dto.graduation_date) : undefined,
    };

    const existing = await db
      .select()
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId))
      .limit(1);

    const now = new Date();

    if (existing.length > 0) {
      await db
        .update(alumniProfilesTable)
        .set({ ...(profileData as any), updated_at: now })
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
      ...(profileData as any),
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

  // ─── Bids ────────────────────────────────────────────────────────────────────────
  static async placeBid(userId: number, dto: PlaceBidDto) {
    await assertUserExists(userId);

    // Enforce monthly win limit
    const limit = await AlumniService.checkMonthlyLimit(userId);
    if (limit.hasReachedLimit) {
      const err = new Error(`Monthly limit reached (${limit.limit}). You cannot bid for featured alumni this month.`);
      (err as any).statusCode = 409;
      throw err;
    }

    // Only bid for tomorrow's slot
    const targetDay = tomorrowMidnight();

    // Slot must still be open (no winner selected yet)
    const slotRows = await db.select().from(featureDaysTable).where(eq(featureDaysTable.day, targetDay)).limit(1);
    const slot = slotRows[0] ?? null;
    if (slot && slot.winner_user_id !== null) {
      const err = new Error("Bidding is closed for tomorrow (winner already selected)");
      (err as any).statusCode = 409;
      throw err;
    }

    // One active pending bid per user per target day
    const existingPending = await db
      .select()
      .from(bidsTable)
      .where(and(eq(bidsTable.user_id, userId), eq(bidsTable.target_day, targetDay), eq(bidsTable.status, "pending")))
      .orderBy(desc(bidsTable.created_at))
      .limit(1);
    if (existingPending.length > 0) {
      const err = new Error("You already have a pending bid for tomorrow. Use update instead.");
      (err as any).statusCode = 409;
      throw err;
    }

    const now = new Date();

    const created = await db
      .insert(bidsTable)
      .values({
        user_id: userId,
        target_day: targetDay,
        amount: String(dto.amount),
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .$returningId();

    const bidId = created[0]?.id;
    if (bidId === undefined) {
      const err = new Error("Failed to place bid");
      (err as any).statusCode = 500;
      throw err;
    }

    const rows = await db
      .select()
      .from(bidsTable)
      .where(eq(bidsTable.id, bidId))
      .limit(1);

    return rows[0]!;
  }

  static async updateBid(userId: number, bidId: number, dto: UpdateBidDto) {
    const rows = await db
      .select()
      .from(bidsTable)
      .where(and(eq(bidsTable.id, bidId), eq(bidsTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Bid not found");

    const bid = rows[0]!;
    if (bid.status !== "pending") {
      const err = new Error(`Cannot update a bid with status "${bid.status}". Only pending bids can be updated.`);
      (err as any).statusCode = 409;
      throw err;
    }

    // Only allow increasing bids
    const currentAmount = Number(bid.amount);
    if (!(dto.amount > currentAmount)) {
      const err = new Error("Bid updates must increase the amount");
      (err as any).statusCode = 409;
      throw err;
    }

    // Cannot update once the feature slot has been assigned
    const slotRows = await db.select().from(featureDaysTable).where(eq(featureDaysTable.day, bid.target_day)).limit(1);
    const slot = slotRows[0] ?? null;
    if (slot && slot.winner_user_id !== null) {
      const err = new Error("Bidding is closed for this slot (winner already selected)");
      (err as any).statusCode = 409;
      throw err;
    }

    await db
      .update(bidsTable)
      .set({ amount: String(dto.amount), updated_at: new Date() })
      .where(eq(bidsTable.id, bidId));

    const updated = await db
      .select()
      .from(bidsTable)
      .where(eq(bidsTable.id, bidId))
      .limit(1);

    return updated[0]!;
  }

  static async cancelBid(userId: number, bidId: number): Promise<void> {
    const rows = await db
      .select()
      .from(bidsTable)
      .where(and(eq(bidsTable.id, bidId), eq(bidsTable.user_id, userId)))
      .limit(1);

    if (rows.length === 0) notFound("Bid not found");

    const bid = rows[0]!;
    if (bid.status === "cancelled") {
      const err = new Error("Bid is already cancelled");
      (err as any).statusCode = 409;
      throw err;
    }
    if (bid.status !== "pending") {
      const err = new Error(`Cannot cancel a bid with status "${bid.status}"`);
      (err as any).statusCode = 409;
      throw err;
    }

    const slotRows = await db.select().from(featureDaysTable).where(eq(featureDaysTable.day, bid.target_day)).limit(1);
    const slot = slotRows[0] ?? null;
    if (slot && slot.winner_user_id !== null) {
      const err = new Error("Bidding is closed for this slot (winner already selected)");
      (err as any).statusCode = 409;
      throw err;
    }

    await db
      .update(bidsTable)
      .set({ status: "cancelled", updated_at: new Date() })
      .where(eq(bidsTable.id, bidId));
  }

  static async getMyBidStatus(userId: number) {
    await assertUserExists(userId);

    const rows = await db
      .select()
      .from(bidsTable)
      .where(eq(bidsTable.user_id, userId))
      .orderBy(desc(bidsTable.created_at))
      .limit(1);

    return rows[0] ?? null;
  }

  static async getBiddingHistory(userId: number) {
    await assertUserExists(userId);

    return db
      .select()
      .from(bidsTable)
      .where(eq(bidsTable.user_id, userId))
      .orderBy(desc(bidsTable.created_at));
  }

  // ─── Slot & Limits ────────────────────────────────────────────────────────────

  /**
   * #39 — getTomorrowSlot
   * Returns the feature_days row for tomorrow, or null if no slot has been
   * created yet (meaning it is open for bidding).
   */
  static async getTomorrowSlot() {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowMidnight = midnight(tomorrowDate);
    const tomorrowStr = formatDate(tomorrowDate);

    const rows = await db
      .select()
      .from(featureDaysTable)
      .where(eq(featureDaysTable.day, tomorrowMidnight))
      .limit(1);

    const slot = rows[0] ?? null;
    return {
      date: tomorrowStr,
      isOpen: slot === null || slot.winner_user_id === null,
      slot,
    };
  }

  /**
   * #41 — getMonthlyAppearanceCount
   * Returns how many times the user has won the feature day this calendar month
   * (from featureDaysTable) plus their cumulative total from alumni_profiles.
   */
  static async getMonthlyAppearanceCount(userId: number) {
    await assertUserExists(userId);

    const now = new Date();
    const firstOfMonth = midnight(new Date(now.getFullYear(), now.getMonth(), 1));
    const firstOfNextMonth = midnight(new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const monthlyRows = await db
      .select()
      .from(featureDaysTable)
      .where(
        and(
          eq(featureDaysTable.winner_user_id, userId),
          gte(featureDaysTable.day, firstOfMonth),
          lt(featureDaysTable.day, firstOfNextMonth),
        ),
      );

    const profileRows = await db
      .select({ appearance_count: alumniProfilesTable.appearance_count })
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, userId))
      .limit(1);

    return {
      month: currentMonth,
      monthlyCount: monthlyRows.length,
      totalCount: profileRows[0]?.appearance_count ?? 0,
    };
  }

  /**
   * #40 — checkMonthlyLimit
   * Checks whether the user has already reached their monthly feature-day limit.
   * Returns current count, the cap, whether the limit is hit, and remaining slots.
   */
  static async checkMonthlyLimit(userId: number) {
    await assertUserExists(userId);

    const { monthlyCount, month } = await AlumniService.getMonthlyAppearanceCount(userId);

    return {
      month,
      currentCount: monthlyCount,
      limit: MONTHLY_APPEARANCE_LIMIT,
      hasReachedLimit: monthlyCount >= MONTHLY_APPEARANCE_LIMIT,
      remainingSlots: Math.max(0, MONTHLY_APPEARANCE_LIMIT - monthlyCount),
    };
  }

  /**
   * Selects a winner for the given feature day (default: today at midnight).
   * - Picks highest pending bid for that day.\n+   * - Marks winning bid as \"won\" and others as \"lost\".\n+   * - Writes the feature_days winner_user_id and winning_bid_id.\n+   */
  static async selectWinnerForDay(day: Date = todayMidnight()) {
    const dayMidnight = midnight(day);

    // If already selected, no-op
    const existingSlot = await db.select().from(featureDaysTable).where(eq(featureDaysTable.day, dayMidnight)).limit(1);
    if (existingSlot[0]?.winner_user_id) return { selected: false, reason: "already_selected" as const };

    const pendingBids = await db
      .select()
      .from(bidsTable)
      .where(and(eq(bidsTable.target_day, dayMidnight), eq(bidsTable.status, "pending")))
      .orderBy(desc(bidsTable.amount), desc(bidsTable.created_at));

    if (pendingBids.length === 0) {
      return { selected: false, reason: "no_bids" as const };
    }

    // Filter out users who have hit the monthly win limit
    const eligible: typeof pendingBids = [];
    for (const bid of pendingBids) {
      const limit = await AlumniService.checkMonthlyLimit(bid.user_id);
      if (!limit.hasReachedLimit) eligible.push(bid);
    }
    if (eligible.length === 0) {
      return { selected: false, reason: "no_eligible_bids" as const };
    }

    const winning = eligible[0]!;
    const now = new Date();

    // Create or update feature_days row
    if (existingSlot.length === 0) {
      await db.insert(featureDaysTable).values({
        day: dayMidnight,
        winner_user_id: winning.user_id,
        winning_bid_id: winning.id,
        selected_at: now,
      });
    } else {
      await db
        .update(featureDaysTable)
        .set({ winner_user_id: winning.user_id, winning_bid_id: winning.id, selected_at: now })
        .where(eq(featureDaysTable.id, existingSlot[0]!.id));
    }

    // Update bid statuses
    await db.update(bidsTable).set({ status: "won", updated_at: now }).where(eq(bidsTable.id, winning.id));
    await db
      .update(bidsTable)
      .set({ status: "lost", updated_at: now })
      .where(and(eq(bidsTable.target_day, dayMidnight), eq(bidsTable.status, "pending")));

    // Increment appearance count for the winner (all-time total)
    const profileRows = await db
      .select()
      .from(alumniProfilesTable)
      .where(eq(alumniProfilesTable.user_id, winning.user_id))
      .limit(1);
    if (profileRows.length > 0) {
      const current = profileRows[0]!.appearance_count ?? 0;
      await db
        .update(alumniProfilesTable)
        .set({ appearance_count: current + 1, updated_at: now })
        .where(eq(alumniProfilesTable.user_id, winning.user_id));
    }

    return { selected: true, winnerUserId: winning.user_id, winningBidId: winning.id };
  }
}
