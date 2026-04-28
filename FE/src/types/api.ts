export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  age: number | null;
  role: string;
  is_email_verified: number;
  last_login_at: string;
}

export interface LoginPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface AlumniProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  bio: string | null;
  graduation_year: number | null;
  graduation_date?: string | null;
  degree: string | null;
  programme?: string | null;
  industry_sector?: string | null;
  geography?: string | null;
  current_position: string | null;
  linkedin_url: string | null;
  appearance_count: number;
  created_at: string;
  updated_at: string;
}

export interface DegreeRecord {
  id: number;
  user_id: number;
  title: string;
  institution_name: string;
  official_url: string | null;
  completed_on: string | null;
}

export interface CertificationRecord {
  id: number;
  user_id: number;
  name: string;
  provider: string;
  course_url: string | null;
  completed_on: string | null;
}

export interface EmploymentRecord {
  id: number;
  user_id: number;
  company: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
}

export interface AlumniFullProfile {
  profile: AlumniProfile;
  degrees: DegreeRecord[];
  certifications: CertificationRecord[];
  licenses: Array<Record<string, unknown>>;
  professionalCourses: Array<Record<string, unknown>>;
  employmentHistory: EmploymentRecord[];
}

export interface BidRecord {
  id: number;
  user_id: number;
  target_day?: string;
  amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SlotStatus {
  date: string;
  isOpen: boolean;
  slot: Record<string, unknown> | null;
}

export interface AppearanceCount {
  month: string;
  monthlyCount: number;
  totalCount: number;
}

export interface MonthlyLimit {
  month: string;
  currentCount: number;
  limit: number;
  hasReachedLimit: boolean;
  remainingSlots: number;
}
