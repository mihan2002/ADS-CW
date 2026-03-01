import type { IUser } from "./IUser";



export class User implements IUser {

  name: string;
  age: number;
  email: string;
  role: string;
  is_email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  createdAt: Date;
 
  constructor(
   
    name: string,
    age: number,
    email: string,
    role: string,
    is_email_verified: boolean,
    created_at: Date,
    updated_at: Date,
    last_login_at: Date | null,
    createdAt: Date
  ) {

    this.name = name;
    this.age = age;
    this.email = email;
    this.role = role;
    this.is_email_verified = is_email_verified;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.last_login_at = last_login_at;
    this.createdAt = createdAt;
  }



}
