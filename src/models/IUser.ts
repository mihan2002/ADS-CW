// User Model
export interface IUser {
  name: string;
  age: number;
  email: string;
  is_email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  createdAt: Date;
}