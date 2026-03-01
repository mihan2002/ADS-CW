import type { Request, Response } from "express";
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
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = "./uploads/profile-images";
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
		);
	},
});

export const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase(),
		);
		const mimetype = allowedTypes.test(file.mimetype);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Only image files are allowed!"));
		}
	},
});

export class AlumniController {
	// ====================
	// Alumni Profile Methods
	// ====================

	/**
	 * Get complete alumni profile with all related data
	 */
	static async getProfile(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			// Verify user exists
			const user = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.id, userId))
				.limit(1);

			if (user.length === 0) {
				res.status(404).json({
					success: false,
					message: "User not found",
				});
				return;
			}

			// Get alumni profile
			const profile = await db
				.select()
				.from(alumniProfilesTable)
				.where(eq(alumniProfilesTable.user_id, userId))
				.limit(1);

			// Get all related data
			const [degrees, certifications, licenses, courses, employmentHistory] =
				await Promise.all([
					db
						.select()
						.from(degreesTable)
						.where(eq(degreesTable.user_id, userId)),
					db
						.select()
						.from(certificationsTable)
						.where(eq(certificationsTable.user_id, userId)),
					db
						.select()
						.from(licensesTable)
						.where(eq(licensesTable.user_id, userId)),
					db
						.select()
						.from(professionalCoursesTable)
						.where(eq(professionalCoursesTable.user_id, userId)),
					db
						.select()
						.from(employmentHistoryTable)
						.where(eq(employmentHistoryTable.user_id, userId)),
				]);

			res.status(200).json({
				success: true,
				data: {
					profile: profile[0] || null,
					degrees,
					certifications,
					licenses,
					professionalCourses: courses,
					employmentHistory,
				},
				message: "Alumni profile retrieved successfully",
			});
		} catch (error) {
			console.error("Error fetching alumni profile:", error);
			res.status(500).json({
				success: false,
				message: "Failed to retrieve alumni profile",
			});
		}
	}

	/**
	 * Get all alumni profiles
	 */
	static async getAllProfiles(req: Request, res: Response): Promise<void> {
		try {
			const profiles = await db.select().from(alumniProfilesTable);

			res.status(200).json({
				success: true,
				data: profiles,
				message: "Alumni profiles retrieved successfully",
			});
		} catch (error) {
			console.error("Error fetching alumni profiles:", error);
			res.status(500).json({
				success: false,
				message: "Failed to retrieve alumni profiles",
			});
		}
	}

	/**
	 * Create or update alumni profile
	 */
	static async createOrUpdateProfile(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const {
				first_name,
				last_name,
				bio,
				graduation_year,
				degree,
				current_position,
				linkedin_url,
			} = req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			if (!first_name || !last_name) {
				res.status(400).json({
					success: false,
					message: "First name and last name are required",
				});
				return;
			}

			// Verify user exists
			const user = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.id, userId))
				.limit(1);

			if (user.length === 0) {
				res.status(404).json({
					success: false,
					message: "User not found",
				});
				return;
			}

			// Check if profile exists
			const existingProfile = await db
				.select()
				.from(alumniProfilesTable)
				.where(eq(alumniProfilesTable.user_id, userId))
				.limit(1);

			const now = new Date();

			if (existingProfile.length > 0) {
				// Update existing profile
				await db
					.update(alumniProfilesTable)
					.set({
						first_name,
						last_name,
						bio,
						graduation_year,
						degree,
						current_position,
						linkedin_url,
						updated_at: now,
					})
					.where(eq(alumniProfilesTable.user_id, userId));

				const updatedProfile = await db
					.select()
					.from(alumniProfilesTable)
					.where(eq(alumniProfilesTable.user_id, userId))
					.limit(1);

				res.status(200).json({
					success: true,
					data: updatedProfile[0],
					message: "Alumni profile updated successfully",
				});
			} else {
				// Create new profile
				await db.insert(alumniProfilesTable).values({
					user_id: userId,
					first_name,
					last_name,
					bio,
					graduation_year,
					degree,
					current_position,
					linkedin_url,
					created_at: now,
					updated_at: now,
				});

				const newProfile = await db
					.select()
					.from(alumniProfilesTable)
					.where(eq(alumniProfilesTable.user_id, userId))
					.limit(1);

				res.status(201).json({
					success: true,
					data: newProfile[0],
					message: "Alumni profile created successfully",
				});
			}
		} catch (error) {
			console.error("Error creating/updating alumni profile:", error);
			res.status(500).json({
				success: false,
				message: "Failed to create/update alumni profile",
			});
		}
	}

	/**
	 * Upload profile image
	 */
	static async uploadProfileImage(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			if (!req.file) {
				res.status(400).json({
					success: false,
					message: "No file uploaded",
				});
				return;
			}

			// Verify profile exists
			const profile = await db
				.select()
				.from(alumniProfilesTable)
				.where(eq(alumniProfilesTable.user_id, userId))
				.limit(1);

			if (profile.length === 0) {
				res.status(404).json({
					success: false,
					message: "Alumni profile not found",
				});
				return;
			}

			const filePath = `/uploads/profile-images/${req.file.filename}`;

			res.status(200).json({
				success: true,
				data: {
					filename: req.file.filename,
					path: filePath,
					size: req.file.size,
				},
				message: "Profile image uploaded successfully",
			});
		} catch (error) {
			console.error("Error uploading profile image:", error);
			res.status(500).json({
				success: false,
				message: "Failed to upload profile image",
			});
		}
	}

	// ====================
	// Degree Methods
	// ====================

	/**
	 * Add a degree
	 */
	static async addDegree(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const { title, institution_name, official_url, completed_on } = req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			if (!title || !institution_name) {
				res.status(400).json({
					success: false,
					message: "Title and institution name are required",
				});
				return;
			}

			const now = new Date();

			const created = await db
				.insert(degreesTable)
				.values({
					user_id: userId,
					title,
					institution_name,
					official_url,
					completed_on: completed_on ? new Date(completed_on) : null,
					created_at: now,
				})
				.$returningId();

			const degreeId = created[0]?.id;

			if (degreeId === undefined) {
				res.status(500).json({
					success: false,
					message: "Failed to add degree",
				});
				return;
			}

			const newDegree = await db
				.select()
				.from(degreesTable)
				.where(eq(degreesTable.id, degreeId))
				.limit(1);

			res.status(201).json({
				success: true,
				data: newDegree[0],
				message: "Degree added successfully",
			});
		} catch (error) {
			console.error("Error adding degree:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add degree",
			});
		}
	}

	/**
	 * Update a degree
	 */
	static async updateDegree(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const degreeId = Number(req.params.degreeId);
			const { title, institution_name, official_url, completed_on } = req.body;

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(degreeId) ||
				degreeId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and degree ID are required",
				});
				return;
			}

			// Verify degree belongs to user
			const degree = await db
				.select()
				.from(degreesTable)
				.where(
					and(
						eq(degreesTable.id, degreeId),
						eq(degreesTable.user_id, userId),
					),
				)
				.limit(1);

			if (degree.length === 0) {
				res.status(404).json({
					success: false,
					message: "Degree not found",
				});
				return;
			}

			const existingDegree = degree[0]!;

			await db
				.update(degreesTable)
				.set({
					title: title || existingDegree.title,
					institution_name: institution_name || existingDegree.institution_name,
					official_url: official_url !== undefined ? official_url : existingDegree.official_url,
					completed_on: completed_on ? new Date(completed_on) : existingDegree.completed_on,
				})
				.where(eq(degreesTable.id, degreeId));

			const updatedDegree = await db
				.select()
				.from(degreesTable)
				.where(eq(degreesTable.id, degreeId))
				.limit(1);

			res.status(200).json({
				success: true,
				data: updatedDegree[0],
				message: "Degree updated successfully",
			});
		} catch (error) {
			console.error("Error updating degree:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update degree",
			});
		}
	}

	/**
	 * Delete a degree
	 */
	static async deleteDegree(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const degreeId = Number(req.params.degreeId);

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(degreeId) ||
				degreeId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and degree ID are required",
				});
				return;
			}

			// Verify degree belongs to user
			const degree = await db
				.select()
				.from(degreesTable)
				.where(
					and(
						eq(degreesTable.id, degreeId),
						eq(degreesTable.user_id, userId),
					),
				)
				.limit(1);

			if (degree.length === 0) {
				res.status(404).json({
					success: false,
					message: "Degree not found",
				});
				return;
			}

			await db.delete(degreesTable).where(eq(degreesTable.id, degreeId));

			res.status(200).json({
				success: true,
				message: "Degree deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting degree:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete degree",
			});
		}
	}

	// ====================
	// Certification Methods
	// ====================

	/**
	 * Add a certification
	 */
	static async addCertification(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const { name, provider, course_url, completed_on } = req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			if (!name || !provider) {
				res.status(400).json({
					success: false,
					message: "Name and provider are required",
				});
				return;
			}

			const now = new Date();

			const created = await db
				.insert(certificationsTable)
				.values({
					user_id: userId,
					name,
					provider,
					course_url,
					completed_on: completed_on ? new Date(completed_on) : null,
					created_at: now,
				})
				.$returningId();

			const certId = created[0]?.id;

			if (certId === undefined) {
				res.status(500).json({
					success: false,
					message: "Failed to add certification",
				});
				return;
			}

			const newCert = await db
				.select()
				.from(certificationsTable)
				.where(eq(certificationsTable.id, certId))
				.limit(1);

			res.status(201).json({
				success: true,
				data: newCert[0],
				message: "Certification added successfully",
			});
		} catch (error) {
			console.error("Error adding certification:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add certification",
			});
		}
	}

	/**
	 * Update a certification
	 */
	static async updateCertification(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const certId = Number(req.params.certId);
			const { name, provider, course_url, completed_on } = req.body;

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(certId) ||
				certId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and certification ID are required",
				});
				return;
			}

			// Verify certification belongs to user
			const cert = await db
				.select()
				.from(certificationsTable)
				.where(
					and(
						eq(certificationsTable.id, certId),
						eq(certificationsTable.user_id, userId),
					),
				)
				.limit(1);

			if (cert.length === 0) {
				res.status(404).json({
					success: false,
					message: "Certification not found",
				});
				return;
			}

			const existingCert = cert[0]!;

			await db
				.update(certificationsTable)
				.set({
					name: name || existingCert.name,
					provider: provider || existingCert.provider,
					course_url: course_url !== undefined ? course_url : existingCert.course_url,
					completed_on: completed_on ? new Date(completed_on) : existingCert.completed_on,
				})
				.where(eq(certificationsTable.id, certId));

			const updatedCert = await db
				.select()
				.from(certificationsTable)
				.where(eq(certificationsTable.id, certId))
				.limit(1);

			res.status(200).json({
				success: true,
				data: updatedCert[0],
				message: "Certification updated successfully",
			});
		} catch (error) {
			console.error("Error updating certification:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update certification",
			});
		}
	}

	/**
	 * Delete a certification
	 */
	static async deleteCertification(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const certId = Number(req.params.certId);

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(certId) ||
				certId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and certification ID are required",
				});
				return;
			}

			// Verify certification belongs to user
			const cert = await db
				.select()
				.from(certificationsTable)
				.where(
					and(
						eq(certificationsTable.id, certId),
						eq(certificationsTable.user_id, userId),
					),
				)
				.limit(1);

			if (cert.length === 0) {
				res.status(404).json({
					success: false,
					message: "Certification not found",
				});
				return;
			}

			await db
				.delete(certificationsTable)
				.where(eq(certificationsTable.id, certId));

			res.status(200).json({
				success: true,
				message: "Certification deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting certification:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete certification",
			});
		}
	}

	// ====================
	// License Methods
	// ====================

	/**
	 * Add a license
	 */
	static async addLicense(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const { name, awarding_body, license_url, completed_on } = req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			if (!name || !awarding_body) {
				res.status(400).json({
					success: false,
					message: "Name and awarding body are required",
				});
				return;
			}

			const now = new Date();

			const created = await db
				.insert(licensesTable)
				.values({
					user_id: userId,
					name,
					awarding_body,
					license_url,
					completed_on: completed_on ? new Date(completed_on) : null,
					created_at: now,
				})
				.$returningId();

			const licenseId = created[0]?.id;

			if (licenseId === undefined) {
				res.status(500).json({
					success: false,
					message: "Failed to add license",
				});
				return;
			}

			const newLicense = await db
				.select()
				.from(licensesTable)
				.where(eq(licensesTable.id, licenseId))
				.limit(1);

			res.status(201).json({
				success: true,
				data: newLicense[0],
				message: "License added successfully",
			});
		} catch (error) {
			console.error("Error adding license:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add license",
			});
		}
	}

	/**
	 * Update a license
	 */
	static async updateLicense(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const licenseId = Number(req.params.licenseId);
			const { name, awarding_body, license_url, completed_on } = req.body;

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(licenseId) ||
				licenseId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and license ID are required",
				});
				return;
			}

			// Verify license belongs to user
			const license = await db
				.select()
				.from(licensesTable)
				.where(
					and(
						eq(licensesTable.id, licenseId),
						eq(licensesTable.user_id, userId),
					),
				)
				.limit(1);

			if (license.length === 0) {
				res.status(404).json({
					success: false,
					message: "License not found",
				});
				return;
			}

			const existingLicense = license[0]!;

			await db
				.update(licensesTable)
				.set({
					name: name || existingLicense.name,
					awarding_body: awarding_body || existingLicense.awarding_body,
					license_url: license_url !== undefined ? license_url : existingLicense.license_url,
					completed_on: completed_on ? new Date(completed_on) : existingLicense.completed_on,
				})
				.where(eq(licensesTable.id, licenseId));

			const updatedLicense = await db
				.select()
				.from(licensesTable)
				.where(eq(licensesTable.id, licenseId))
				.limit(1);

			res.status(200).json({
				success: true,
				data: updatedLicense[0],
				message: "License updated successfully",
			});
		} catch (error) {
			console.error("Error updating license:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update license",
			});
		}
	}

	/**
	 * Delete a license
	 */
	static async deleteLicense(req: Request, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const licenseId = Number(req.params.licenseId);

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(licenseId) ||
				licenseId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and license ID are required",
				});
				return;
			}

			// Verify license belongs to user
			const license = await db
				.select()
				.from(licensesTable)
				.where(
					and(
						eq(licensesTable.id, licenseId),
						eq(licensesTable.user_id, userId),
					),
				)
				.limit(1);

			if (license.length === 0) {
				res.status(404).json({
					success: false,
					message: "License not found",
				});
				return;
			}

			await db.delete(licensesTable).where(eq(licensesTable.id, licenseId));

			res.status(200).json({
				success: true,
				message: "License deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting license:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete license",
			});
		}
	}

	// ====================
	// Professional Course Methods
	// ====================

	/**
	 * Add a professional course
	 */
	static async addProfessionalCourse(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const { title, provider, course_url, completed_on } = req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			if (!title || !provider) {
				res.status(400).json({
					success: false,
					message: "Title and provider are required",
				});
				return;
			}

			const now = new Date();

			const created = await db
				.insert(professionalCoursesTable)
				.values({
					user_id: userId,
					title,
					provider,
					course_url,
					completed_on: completed_on ? new Date(completed_on) : null,
					created_at: now,
				})
				.$returningId();

			const courseId = created[0]?.id;

			if (courseId === undefined) {
				res.status(500).json({
					success: false,
					message: "Failed to add professional course",
				});
				return;
			}

			const newCourse = await db
				.select()
				.from(professionalCoursesTable)
				.where(eq(professionalCoursesTable.id, courseId))
				.limit(1);

			res.status(201).json({
				success: true,
				data: newCourse[0],
				message: "Professional course added successfully",
			});
		} catch (error) {
			console.error("Error adding professional course:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add professional course",
			});
		}
	}

	/**
	 * Update a professional course
	 */
	static async updateProfessionalCourse(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const courseId = Number(req.params.courseId);
			const { title, provider, course_url, completed_on } = req.body;

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(courseId) ||
				courseId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and course ID are required",
				});
				return;
			}

			// Verify course belongs to user
			const course = await db
				.select()
				.from(professionalCoursesTable)
				.where(
					and(
						eq(professionalCoursesTable.id, courseId),
						eq(professionalCoursesTable.user_id, userId),
					),
				)
				.limit(1);

			if (course.length === 0) {
				res.status(404).json({
					success: false,
					message: "Professional course not found",
				});
				return;
			}

			const existingCourse = course[0]!;

			await db
				.update(professionalCoursesTable)
				.set({
					title: title || existingCourse.title,
					provider: provider || existingCourse.provider,
					course_url: course_url !== undefined ? course_url : existingCourse.course_url,
					completed_on: completed_on ? new Date(completed_on) : existingCourse.completed_on,
				})
				.where(eq(professionalCoursesTable.id, courseId));

			const updatedCourse = await db
				.select()
				.from(professionalCoursesTable)
				.where(eq(professionalCoursesTable.id, courseId))
				.limit(1);

			res.status(200).json({
				success: true,
				data: updatedCourse[0],
				message: "Professional course updated successfully",
			});
		} catch (error) {
			console.error("Error updating professional course:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update professional course",
			});
		}
	}

	/**
	 * Delete a professional course
	 */
	static async deleteProfessionalCourse(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const courseId = Number(req.params.courseId);

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(courseId) ||
				courseId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and course ID are required",
				});
				return;
			}

			// Verify course belongs to user
			const course = await db
				.select()
				.from(professionalCoursesTable)
				.where(
					and(
						eq(professionalCoursesTable.id, courseId),
						eq(professionalCoursesTable.user_id, userId),
					),
				)
				.limit(1);

			if (course.length === 0) {
				res.status(404).json({
					success: false,
					message: "Professional course not found",
				});
				return;
			}

			await db
				.delete(professionalCoursesTable)
				.where(eq(professionalCoursesTable.id, courseId));

			res.status(200).json({
				success: true,
				message: "Professional course deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting professional course:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete professional course",
			});
		}
	}

	// ====================
	// Employment History Methods
	// ====================

	/**
	 * Add employment history
	 */
	static async addEmploymentHistory(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const { company, job_title, start_date, end_date, description } =
				req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				res.status(400).json({
					success: false,
					message: "Valid user ID is required",
				});
				return;
			}

			if (!company || !job_title || !start_date) {
				res.status(400).json({
					success: false,
					message: "Company, job title, and start date are required",
				});
				return;
			}

			const now = new Date();

			const created = await db
				.insert(employmentHistoryTable)
				.values({
					user_id: userId,
					company,
					job_title,
					start_date: new Date(start_date),
					end_date: end_date ? new Date(end_date) : null,
					description,
					created_at: now,
					updated_at: now,
				})
				.$returningId();

			const employmentId = created[0]?.id;

			if (employmentId === undefined) {
				res.status(500).json({
					success: false,
					message: "Failed to add employment history",
				});
				return;
			}

			const newEmployment = await db
				.select()
				.from(employmentHistoryTable)
				.where(eq(employmentHistoryTable.id, employmentId))
				.limit(1);

			res.status(201).json({
				success: true,
				data: newEmployment[0],
				message: "Employment history added successfully",
			});
		} catch (error) {
			console.error("Error adding employment history:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add employment history",
			});
		}
	}

	/**
	 * Update employment history
	 */
	static async updateEmploymentHistory(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const employmentId = Number(req.params.employmentId);
			const { company, job_title, start_date, end_date, description } =
				req.body;

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(employmentId) ||
				employmentId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and employment ID are required",
				});
				return;
			}

			// Verify employment belongs to user
			const employment = await db
				.select()
				.from(employmentHistoryTable)
				.where(
					and(
						eq(employmentHistoryTable.id, employmentId),
						eq(employmentHistoryTable.user_id, userId),
					),
				)
				.limit(1);

			if (employment.length === 0) {
				res.status(404).json({
					success: false,
					message: "Employment history not found",
				});
				return;
			}

			const existingEmployment = employment[0]!;
			const now = new Date();

			await db
				.update(employmentHistoryTable)
				.set({
					company: company || existingEmployment.company,
					job_title: job_title || existingEmployment.job_title,
					start_date: start_date ? new Date(start_date) : existingEmployment.start_date,
					end_date: end_date ? new Date(end_date) : (end_date === null ? null : existingEmployment.end_date),
					description: description !== undefined ? description : existingEmployment.description,
					updated_at: now,
				})
				.where(eq(employmentHistoryTable.id, employmentId));

			const updatedEmployment = await db
				.select()
				.from(employmentHistoryTable)
				.where(eq(employmentHistoryTable.id, employmentId))
				.limit(1);

			res.status(200).json({
				success: true,
				data: updatedEmployment[0],
				message: "Employment history updated successfully",
			});
		} catch (error) {
			console.error("Error updating employment history:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update employment history",
			});
		}
	}

	/**
	 * Delete employment history
	 */
	static async deleteEmploymentHistory(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const userId = Number(req.params.userId);
			const employmentId = Number(req.params.employmentId);

			if (
				!Number.isInteger(userId) ||
				userId <= 0 ||
				!Number.isInteger(employmentId) ||
				employmentId <= 0
			) {
				res.status(400).json({
					success: false,
					message: "Valid user ID and employment ID are required",
				});
				return;
			}

			// Verify employment belongs to user
			const employment = await db
				.select()
				.from(employmentHistoryTable)
				.where(
					and(
						eq(employmentHistoryTable.id, employmentId),
						eq(employmentHistoryTable.user_id, userId),
					),
				)
				.limit(1);

			if (employment.length === 0) {
				res.status(404).json({
					success: false,
					message: "Employment history not found",
				});
				return;
			}

			await db
				.delete(employmentHistoryTable)
				.where(eq(employmentHistoryTable.id, employmentId));

			res.status(200).json({
				success: true,
				message: "Employment history deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting employment history:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete employment history",
			});
		}
	}
}
