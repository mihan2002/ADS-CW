import api from './axiosInstance';
import type {
  ApiResponse,
  AlumniProfile,
  FullAlumniProfile,
  SlotStatus,
  AppearanceCount,
  MonthlyLimit,
} from '@/types';

export const alumniApi = {
  // ─── Profile endpoints ────────────────────────────────────────────────────────
  getAllAlumni: () =>
    api.get<ApiResponse<AlumniProfile[]>>('/alumni'),

  getAlumniProfile: (userId: number) =>
    api.get<ApiResponse<FullAlumniProfile>>(`/alumni/${userId}`),

  createOrUpdateProfile: (userId: number, data: Partial<AlumniProfile>) =>
    api.post<ApiResponse<AlumniProfile>>(`/alumni/${userId}/profile`, data),

  deleteProfile: (userId: number) =>
    api.delete<ApiResponse<null>>(`/alumni/${userId}/profile`),

  uploadProfileImage: (userId: number, file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return api.post<ApiResponse<unknown>>(`/alumni/${userId}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ─── Degree endpoints ─────────────────────────────────────────────────────────
  addDegree: (userId: number, data: { title: string; institution_name: string; official_url?: string; completed_on?: string }) =>
    api.post<ApiResponse<unknown>>(`/alumni/${userId}/degrees`, data),

  updateDegree: (userId: number, degreeId: number, data: Partial<{ title: string; institution_name: string; official_url: string; completed_on: string }>) =>
    api.put<ApiResponse<unknown>>(`/alumni/${userId}/degrees/${degreeId}`, data),

  deleteDegree: (userId: number, degreeId: number) =>
    api.delete<ApiResponse<null>>(`/alumni/${userId}/degrees/${degreeId}`),

  // ─── Certification endpoints ──────────────────────────────────────────────────
  addCertification: (userId: number, data: { name: string; provider: string; course_url?: string; completed_on?: string }) =>
    api.post<ApiResponse<unknown>>(`/alumni/${userId}/certifications`, data),

  updateCertification: (userId: number, certId: number, data: Partial<{ name: string; provider: string; course_url: string; completed_on: string }>) =>
    api.put<ApiResponse<unknown>>(`/alumni/${userId}/certifications/${certId}`, data),

  deleteCertification: (userId: number, certId: number) =>
    api.delete<ApiResponse<null>>(`/alumni/${userId}/certifications/${certId}`),

  // ─── License endpoints ────────────────────────────────────────────────────────
  addLicense: (userId: number, data: { name: string; awarding_body: string; license_url?: string; completed_on?: string }) =>
    api.post<ApiResponse<unknown>>(`/alumni/${userId}/licenses`, data),

  updateLicense: (userId: number, licenseId: number, data: Partial<{ name: string; awarding_body: string; license_url: string; completed_on: string }>) =>
    api.put<ApiResponse<unknown>>(`/alumni/${userId}/licenses/${licenseId}`, data),

  deleteLicense: (userId: number, licenseId: number) =>
    api.delete<ApiResponse<null>>(`/alumni/${userId}/licenses/${licenseId}`),

  // ─── Professional Course endpoints ────────────────────────────────────────────
  addCourse: (userId: number, data: { title: string; provider: string; course_url?: string; completed_on?: string }) =>
    api.post<ApiResponse<unknown>>(`/alumni/${userId}/courses`, data),

  updateCourse: (userId: number, courseId: number, data: Partial<{ title: string; provider: string; course_url: string; completed_on: string }>) =>
    api.put<ApiResponse<unknown>>(`/alumni/${userId}/courses/${courseId}`, data),

  deleteCourse: (userId: number, courseId: number) =>
    api.delete<ApiResponse<null>>(`/alumni/${userId}/courses/${courseId}`),

  // ─── Employment History endpoints ─────────────────────────────────────────────
  addEmployment: (userId: number, data: { company: string; job_title: string; start_date: string; end_date?: string; description?: string }) =>
    api.post<ApiResponse<unknown>>(`/alumni/${userId}/employment`, data),

  updateEmployment: (userId: number, employmentId: number, data: Partial<{ company: string; job_title: string; start_date: string; end_date: string; description: string }>) =>
    api.put<ApiResponse<unknown>>(`/alumni/${userId}/employment/${employmentId}`, data),

  deleteEmployment: (userId: number, employmentId: number) =>
    api.delete<ApiResponse<null>>(`/alumni/${userId}/employment/${employmentId}`),

  // ─── Slot & Limit endpoints ───────────────────────────────────────────────────
  getTomorrowSlot: () =>
    api.get<ApiResponse<SlotStatus>>('/alumni/slots/tomorrow'),

  getAppearanceCount: (userId: number) =>
    api.get<ApiResponse<AppearanceCount>>(`/alumni/${userId}/appearance-count`),

  getMonthlyLimit: (userId: number) =>
    api.get<ApiResponse<MonthlyLimit>>(`/alumni/${userId}/monthly-limit`),
};
