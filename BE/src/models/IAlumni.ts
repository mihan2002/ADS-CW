// Alumni Profile Model
export interface IAlumniProfile {
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
  created_at: Date;
  updated_at: Date;
}

// Degree Model
export interface IDegree {
  id?: number;
  user_id: number;
  title: string;
  institution_name: string;
  official_url?: string;
  completed_on?: Date;
  created_at: Date;
}

// Professional Certification Model
export interface ICertification {
  id?: number;
  user_id: number;
  name: string;
  provider: string;
  course_url?: string;
  completed_on?: Date;
  created_at: Date;
}

// Professional License Model
export interface ILicense {
  id?: number;
  user_id: number;
  name: string;
  awarding_body: string;
  license_url?: string;
  completed_on?: Date;
  created_at: Date;
}

// Professional Course Model
export interface IProfessionalCourse {
  id?: number;
  user_id: number;
  title: string;
  provider: string;
  course_url?: string;
  completed_on?: Date;
  created_at: Date;
}

// Employment History Model
export interface IEmploymentHistory {
  id?: number;
  user_id: number;
  company: string;
  job_title: string;
  start_date: Date;
  end_date?: Date;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Complete Alumni Model
export interface IAlumni {
  profile: IAlumniProfile;
  degrees: IDegree[];
  certifications: ICertification[];
  licenses: ILicense[];
  professionalCourses: IProfessionalCourse[];
  employmentHistory: IEmploymentHistory[];
}
