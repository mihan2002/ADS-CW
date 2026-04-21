// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: 'user' | 'admin' | 'moderator';
  is_email_verified: number;
  last_login_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  age: number;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface TokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

// ─── Alumni Types ─────────────────────────────────────────────────────────────

export interface AlumniProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  bio?: string;
  graduation_year?: number;
  degree?: string;
  current_position?: string;
  linkedin_url?: string;
  profile_image_id?: number;
  appearance_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Degree {
  id: number;
  user_id: number;
  title: string;
  institution_name: string;
  official_url?: string;
  completed_on?: string;
  created_at: string;
}

export interface Certification {
  id: number;
  user_id: number;
  name: string;
  provider: string;
  course_url?: string;
  completed_on?: string;
  created_at: string;
}

export interface License {
  id: number;
  user_id: number;
  name: string;
  awarding_body: string;
  license_url?: string;
  completed_on?: string;
  created_at: string;
}

export interface ProfessionalCourse {
  id: number;
  user_id: number;
  title: string;
  provider: string;
  course_url?: string;
  completed_on?: string;
  created_at: string;
}

export interface EmploymentHistory {
  id: number;
  user_id: number;
  company: string;
  job_title: string;
  start_date: string;
  end_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FullAlumniProfile {
  profile: AlumniProfile;
  degrees: Degree[];
  certifications: Certification[];
  licenses: License[];
  professionalCourses: ProfessionalCourse[];
  employmentHistory: EmploymentHistory[];
}

// ─── Bidding Types ────────────────────────────────────────────────────────────

export interface Bid {
  id: number;
  user_id: number;
  amount: string;
  status: 'pending' | 'cancelled' | 'won';
  created_at: string;
  updated_at: string;
}

export interface SlotStatus {
  date: string;
  isOpen: boolean;
  slot: {
    id: number;
    day: string;
    winner_user_id: number | null;
    winning_bid_id: number | null;
    selected_at: string | null;
  } | null;
}

export interface MonthlyLimit {
  month: string;
  currentCount: number;
  limit: number;
  hasReachedLimit: boolean;
  remainingSlots: number;
}

export interface AppearanceCount {
  month: string;
  monthlyCount: number;
  totalCount: number;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ─── Chart Data Types ─────────────────────────────────────────────────────────

export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}
