import type { Request, Response } from "express";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AlumniService } from "../services/AlumniService.js";
import {
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

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = "./uploads/profile-images";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const okMime = allowed.test(file.mimetype);
    if (okMime && okExt) return cb(null, true);
    cb(new Error("Only image files are allowed!"));
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseIntParam(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
    return;
  }
  const status = (error as any).statusCode ?? 500;
  res.status(status).json({ success: false, message: (error as Error).message });
}

function requireUserId(req: Request, res: Response): number | null {
  const userId = parseIntParam(req.params.userId);
  if (!userId) {
    res.status(400).json({ success: false, message: "Valid user ID is required" });
    return null;
  }
  return userId;
}

// ─── Controller ───────────────────────────────────────────────────────────────
export class AlumniController {
  // ── Profile ─────────────────────────────────────────────────────────────────

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const data = await AlumniService.getProfile(userId);
      res.status(200).json({ success: true, data, message: "Alumni profile retrieved successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getAllProfiles(_req: Request, res: Response): Promise<void> {
    try {
      const profiles = await AlumniService.getAllProfiles();
      res.status(200).json({ success: true, data: profiles, message: "Alumni profiles retrieved successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async createOrUpdateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const dto = CreateOrUpdateProfileDto.parse(req.body);
      const { profile, created } = await AlumniService.createOrUpdateProfile(userId, dto);
      const status = created ? 201 : 200;
      const message = created ? "Alumni profile created successfully" : "Alumni profile updated successfully";
      res.status(status).json({ success: true, data: profile, message });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async uploadProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }
      const data = await AlumniService.uploadProfileImage(userId, req.file);
      res.status(200).json({ success: true, data, message: "Profile image uploaded successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      await AlumniService.deleteProfile(userId);
      res.status(200).json({ success: true, message: "Alumni profile deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  // ── Degrees ──────────────────────────────────────────────────────────────────

  static async addDegree(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const dto = AddDegreeDto.parse(req.body);
      const degree = await AlumniService.addDegree(userId, dto);
      res.status(201).json({ success: true, data: degree, message: "Degree added successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateDegree(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const degreeId = parseIntParam(req.params.degreeId);
      if (!degreeId) {
        res.status(400).json({ success: false, message: "Valid degree ID is required" });
        return;
      }
      const dto = UpdateDegreeDto.parse(req.body);
      const degree = await AlumniService.updateDegree(userId, degreeId, dto);
      res.status(200).json({ success: true, data: degree, message: "Degree updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteDegree(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const degreeId = parseIntParam(req.params.degreeId);
      if (!degreeId) {
        res.status(400).json({ success: false, message: "Valid degree ID is required" });
        return;
      }
      await AlumniService.deleteDegree(userId, degreeId);
      res.status(200).json({ success: true, message: "Degree deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  // ── Certifications ───────────────────────────────────────────────────────────

  static async addCertification(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const dto = AddCertificationDto.parse(req.body);
      const cert = await AlumniService.addCertification(userId, dto);
      res.status(201).json({ success: true, data: cert, message: "Certification added successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateCertification(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const certId = parseIntParam(req.params.certId);
      if (!certId) {
        res.status(400).json({ success: false, message: "Valid certification ID is required" });
        return;
      }
      const dto = UpdateCertificationDto.parse(req.body);
      const cert = await AlumniService.updateCertification(userId, certId, dto);
      res.status(200).json({ success: true, data: cert, message: "Certification updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteCertification(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const certId = parseIntParam(req.params.certId);
      if (!certId) {
        res.status(400).json({ success: false, message: "Valid certification ID is required" });
        return;
      }
      await AlumniService.deleteCertification(userId, certId);
      res.status(200).json({ success: true, message: "Certification deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  // ── Licenses ─────────────────────────────────────────────────────────────────

  static async addLicense(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const dto = AddLicenseDto.parse(req.body);
      const license = await AlumniService.addLicense(userId, dto);
      res.status(201).json({ success: true, data: license, message: "License added successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateLicense(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const licenseId = parseIntParam(req.params.licenseId);
      if (!licenseId) {
        res.status(400).json({ success: false, message: "Valid license ID is required" });
        return;
      }
      const dto = UpdateLicenseDto.parse(req.body);
      const license = await AlumniService.updateLicense(userId, licenseId, dto);
      res.status(200).json({ success: true, data: license, message: "License updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteLicense(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const licenseId = parseIntParam(req.params.licenseId);
      if (!licenseId) {
        res.status(400).json({ success: false, message: "Valid license ID is required" });
        return;
      }
      await AlumniService.deleteLicense(userId, licenseId);
      res.status(200).json({ success: true, message: "License deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  // ── Professional Courses ──────────────────────────────────────────────────────

  static async addProfessionalCourse(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const dto = AddProfessionalCourseDto.parse(req.body);
      const course = await AlumniService.addProfessionalCourse(userId, dto);
      res.status(201).json({ success: true, data: course, message: "Professional course added successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateProfessionalCourse(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const courseId = parseIntParam(req.params.courseId);
      if (!courseId) {
        res.status(400).json({ success: false, message: "Valid course ID is required" });
        return;
      }
      const dto = UpdateProfessionalCourseDto.parse(req.body);
      const course = await AlumniService.updateProfessionalCourse(userId, courseId, dto);
      res.status(200).json({ success: true, data: course, message: "Professional course updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteProfessionalCourse(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const courseId = parseIntParam(req.params.courseId);
      if (!courseId) {
        res.status(400).json({ success: false, message: "Valid course ID is required" });
        return;
      }
      await AlumniService.deleteProfessionalCourse(userId, courseId);
      res.status(200).json({ success: true, message: "Professional course deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  // ── Employment History ────────────────────────────────────────────────────────

  static async addEmploymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const dto = AddEmploymentHistoryDto.parse(req.body);
      const employment = await AlumniService.addEmploymentHistory(userId, dto);
      res.status(201).json({ success: true, data: employment, message: "Employment history added successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateEmploymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const employmentId = parseIntParam(req.params.employmentId);
      if (!employmentId) {
        res.status(400).json({ success: false, message: "Valid employment ID is required" });
        return;
      }
      const dto = UpdateEmploymentHistoryDto.parse(req.body);
      const employment = await AlumniService.updateEmploymentHistory(userId, employmentId, dto);
      res.status(200).json({ success: true, data: employment, message: "Employment history updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteEmploymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const employmentId = parseIntParam(req.params.employmentId);
      if (!employmentId) {
        res.status(400).json({ success: false, message: "Valid employment ID is required" });
        return;
      }
      await AlumniService.deleteEmploymentHistory(userId, employmentId);
      res.status(200).json({ success: true, message: "Employment history deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  // ── Bids ─────────────────────────────────────────────────────────────────────────────

  static async placeBid(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const dto = PlaceBidDto.parse(req.body);
      const bid = await AlumniService.placeBid(userId, dto);
      res.status(201).json({ success: true, data: bid, message: "Bid placed successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateBid(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const bidId = parseIntParam(req.params.bidId);
      if (!bidId) {
        res.status(400).json({ success: false, message: "Valid bid ID is required" });
        return;
      }
      const dto = UpdateBidDto.parse(req.body);
      const bid = await AlumniService.updateBid(userId, bidId, dto);
      res.status(200).json({ success: true, data: bid, message: "Bid updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async cancelBid(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const bidId = parseIntParam(req.params.bidId);
      if (!bidId) {
        res.status(400).json({ success: false, message: "Valid bid ID is required" });
        return;
      }
      await AlumniService.cancelBid(userId, bidId);
      res.status(200).json({ success: true, message: "Bid cancelled successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getMyBidStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const bid = await AlumniService.getMyBidStatus(userId);
      res.status(200).json({ success: true, data: bid, message: "Bid status retrieved successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getBiddingHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const bids = await AlumniService.getBiddingHistory(userId);
      res.status(200).json({ success: true, data: bids, message: "Bidding history retrieved successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }
}
