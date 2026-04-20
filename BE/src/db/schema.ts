import { create } from "domain";
import {
  int,
  mysqlTable,
  serial,
  varchar,
  timestamp,
  decimal,
  date,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  age: int().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 50 }).notNull().default('user'),
  is_email_verified: int().notNull().default(0),
  
  created_at: timestamp().notNull(),
  updated_at: timestamp().notNull(),
  last_login_at: timestamp(),
});

export const emailVerificationTokensTable = mysqlTable(
  "email_verification_tokens",
  {
    id: serial().primaryKey(),
    user_id: int()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    token_hash: varchar({ length: 255 }).notNull().unique(),
    expires_at: timestamp().notNull(),
    used_at: timestamp(),
    created_at: timestamp().notNull(),
  },
);

export const passwordResetTokensTable = mysqlTable("password_reset_tokens", {
  id: serial().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token_hash: varchar({ length: 255 }).notNull().unique(),
  expires_at: timestamp().notNull(),
  used_at: timestamp(),
  created_at: timestamp().notNull(),
});

export const alumniProfilesTable = mysqlTable("alumni_profiles", {
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  first_name: varchar({ length: 255 }).notNull(),
  last_name: varchar({ length: 255 }).notNull(),
  bio: varchar({ length: 1000 }),
  graduation_year: int(),
  degree: varchar({ length: 255 }),
  current_position: varchar({ length: 255 }),
  linkedin_url: varchar({ length: 255 }),
  profile_image_id: int(),
  appearance_count: int().default(0),
  created_at: timestamp().notNull(),
  updated_at: timestamp().notNull(),
});

export const degreesTable = mysqlTable("degrees", {
  id: serial().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  institution_name: varchar({ length: 255 }).notNull(),
  official_url: varchar({ length: 255 }),
  completed_on: timestamp(),
  created_at: timestamp().notNull(),
});

export const certificationsTable = mysqlTable("certifications", {
  id: serial().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  provider: varchar({ length: 255 }).notNull(),
  course_url: varchar({ length: 255 }),
  completed_on: timestamp(),
  created_at: timestamp().notNull(),
});

export const licensesTable = mysqlTable("licenses", {
  id: serial().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  awarding_body: varchar({ length: 255 }).notNull(),
  license_url: varchar({ length: 255 }),
  completed_on: timestamp(),
  created_at: timestamp().notNull(),
});

export const professionalCoursesTable = mysqlTable("professional_courses", {
  id: serial().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  provider: varchar({ length: 255 }).notNull(),
  course_url: varchar({ length: 255 }),
  completed_on: timestamp(),
  created_at: timestamp().notNull(),
});

export const employmentHistoryTable = mysqlTable("employment_history", {
  id: serial().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  company: varchar({ length: 255 }).notNull(),
  job_title: varchar({ length: 255 }).notNull(),
  start_date: timestamp().notNull(),
  end_date: timestamp(),
  description: varchar({ length: 1000 }),
  created_at: timestamp().notNull(),
  updated_at: timestamp().notNull(),
});

export const sponsorsTable = mysqlTable("sponsors", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  website_url: varchar({ length: 255 }),
  created_at: timestamp().notNull(),
  updated_at: timestamp().notNull(),
});

export const sponsorshipOffersTable = mysqlTable("sponsorship_offers", {
  id: serial().primaryKey(),
  sponsor_id: int()
    .notNull()
    .references(() => sponsorsTable.id, { onDelete: "cascade" }),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  offer_type: varchar({ length: 255 }).notNull(),
  reference_id: int().notNull(),
  offer_amount: decimal().notNull(),
  status: varchar({ length: 255 }).notNull(),
  created_at: timestamp().notNull(),
  expires_at: timestamp().notNull(),
});

export const featureDaysTable = mysqlTable("feature_days", {
  id: serial().primaryKey(),
  day: date(),
  winner_user_id: int().references(() => usersTable.id),
  winning_bid_id: int().references(() => bidsTable.id),
  selected_at: timestamp(),
});

export const bidsTable = mysqlTable("bids", {
  id: serial().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id),
  amount: decimal().notNull(),
  status: varchar({ length: 255 }).notNull(),
  created_at: timestamp().notNull(),
  updated_at: timestamp().notNull(),
});

export const alumniEventParticipationTable = mysqlTable(
  "alumni_event_participation",
  {
    id: serial().primaryKey(),
    user_id: int()
      .notNull()
      .references(() => usersTable.id),
    event_date: date().notNull(),
    created_at: timestamp().notNull(),
  },
);
