import type {
  AlumniFullProfile,
  AlumniProfile,
  AppearanceCount,
  BidRecord,
  MonthlyLimit,
  SlotStatus,
} from "../types/api";

const DEV_BIDS_KEY = "ads_dev_mock_bids";

export const devAlumniProfiles: AlumniProfile[] = [
  {
    user_id: 101,
    first_name: "Nimal",
    last_name: "Perera",
    bio: "Software engineer focused on cloud and distributed systems.",
    graduation_year: 2018,
    degree: "BSc Computer Science",
    current_position: "Senior Software Engineer",
    linkedin_url: "https://linkedin.com/in/nimal-perera",
    appearance_count: 2,
    created_at: "2024-01-10T10:30:00.000Z",
    updated_at: "2026-04-20T08:10:00.000Z",
  },
  {
    user_id: 102,
    first_name: "Ama",
    last_name: "Fernando",
    bio: "Data analyst with a passion for product metrics.",
    graduation_year: 2020,
    degree: "BSc Information Systems",
    current_position: "Data Analyst",
    linkedin_url: "https://linkedin.com/in/ama-fernando",
    appearance_count: 1,
    created_at: "2024-02-14T09:00:00.000Z",
    updated_at: "2026-04-19T15:00:00.000Z",
  },
  {
    user_id: 103,
    first_name: "Kasun",
    last_name: "Silva",
    bio: "Product manager with a background in UX.",
    graduation_year: 2016,
    degree: "BBA",
    current_position: "Product Manager",
    linkedin_url: null,
    appearance_count: 0,
    created_at: "2024-03-02T11:20:00.000Z",
    updated_at: "2026-04-18T13:45:00.000Z",
  },
];

export const devAlumniDetails: Record<number, AlumniFullProfile> = {
  101: {
    profile: devAlumniProfiles[0],
    degrees: [
      {
        id: 1,
        user_id: 101,
        title: "BSc Computer Science",
        institution_name: "University of Moratuwa",
        official_url: null,
        completed_on: "2018-06-01T00:00:00.000Z",
      },
    ],
    certifications: [
      {
        id: 11,
        user_id: 101,
        name: "AWS Solutions Architect Associate",
        provider: "AWS",
        course_url: null,
        completed_on: "2023-01-10T00:00:00.000Z",
      },
      {
        id: 12,
        user_id: 101,
        name: "CKA",
        provider: "CNCF",
        course_url: null,
        completed_on: "2024-07-10T00:00:00.000Z",
      },
    ],
    licenses: [],
    professionalCourses: [],
    employmentHistory: [
      {
        id: 21,
        user_id: 101,
        company: "Sysco Labs",
        job_title: "Software Engineer",
        start_date: "2018-09-01T00:00:00.000Z",
        end_date: "2022-05-31T00:00:00.000Z",
      },
      {
        id: 22,
        user_id: 101,
        company: "WSO2",
        job_title: "Senior Software Engineer",
        start_date: "2022-06-01T00:00:00.000Z",
        end_date: null,
      },
    ],
  },
  102: {
    profile: devAlumniProfiles[1],
    degrees: [
      {
        id: 2,
        user_id: 102,
        title: "BSc Information Systems",
        institution_name: "University of Colombo",
        official_url: null,
        completed_on: "2020-12-01T00:00:00.000Z",
      },
    ],
    certifications: [
      {
        id: 13,
        user_id: 102,
        name: "Google Data Analytics",
        provider: "Google",
        course_url: null,
        completed_on: "2022-08-15T00:00:00.000Z",
      },
    ],
    licenses: [],
    professionalCourses: [],
    employmentHistory: [
      {
        id: 23,
        user_id: 102,
        company: "Dialog Axiata",
        job_title: "Business Analyst",
        start_date: "2021-01-01T00:00:00.000Z",
        end_date: "2023-04-30T00:00:00.000Z",
      },
      {
        id: 24,
        user_id: 102,
        company: "99x",
        job_title: "Data Analyst",
        start_date: "2023-05-01T00:00:00.000Z",
        end_date: null,
      },
    ],
  },
  103: {
    profile: devAlumniProfiles[2],
    degrees: [
      {
        id: 3,
        user_id: 103,
        title: "BBA",
        institution_name: "University of Sri Jayewardenepura",
        official_url: null,
        completed_on: "2016-10-01T00:00:00.000Z",
      },
    ],
    certifications: [
      {
        id: 14,
        user_id: 103,
        name: "Scrum Master",
        provider: "Scrum Alliance",
        course_url: null,
        completed_on: "2021-02-01T00:00:00.000Z",
      },
    ],
    licenses: [],
    professionalCourses: [],
    employmentHistory: [
      {
        id: 25,
        user_id: 103,
        company: "Virtusa",
        job_title: "Associate Product Owner",
        start_date: "2017-01-01T00:00:00.000Z",
        end_date: "2020-08-01T00:00:00.000Z",
      },
      {
        id: 26,
        user_id: 103,
        company: "IFS",
        job_title: "Product Manager",
        start_date: "2020-09-01T00:00:00.000Z",
        end_date: null,
      },
    ],
  },
};

const defaultDevBids: BidRecord[] = [
  {
    id: 9001,
    user_id: 999999,
    amount: "1200.00",
    status: "pending",
    created_at: "2026-04-26T10:00:00.000Z",
    updated_at: "2026-04-26T10:00:00.000Z",
  },
  {
    id: 9000,
    user_id: 999999,
    amount: "950.00",
    status: "cancelled",
    created_at: "2026-04-25T10:00:00.000Z",
    updated_at: "2026-04-25T11:00:00.000Z",
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getDevBids(): BidRecord[] {
  const stored = localStorage.getItem(DEV_BIDS_KEY);
  if (!stored) {
    localStorage.setItem(DEV_BIDS_KEY, JSON.stringify(defaultDevBids));
    return clone(defaultDevBids);
  }
  return JSON.parse(stored) as BidRecord[];
}

export function setDevBids(bids: BidRecord[]) {
  localStorage.setItem(DEV_BIDS_KEY, JSON.stringify(bids));
}

export function getDevAppearanceCount(): AppearanceCount {
  return {
    month: "2026-04",
    monthlyCount: 1,
    totalCount: 4,
  };
}

export function getDevMonthlyLimit(): MonthlyLimit {
  return {
    month: "2026-04",
    currentCount: 1,
    limit: 2,
    hasReachedLimit: false,
    remainingSlots: 1,
  };
}

export function getDevTomorrowSlot(): SlotStatus {
  return {
    date: "2026-04-28",
    isOpen: true,
    slot: null,
  };
}
