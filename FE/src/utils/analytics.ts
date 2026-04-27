import type { AlumniFullProfile, AlumniProfile, BidRecord } from "../types/api";

function normalizeLabel(value: string | null | undefined, fallback = "Unknown") {
  const trimmed = (value || "").trim();
  return trimmed.length ? trimmed : fallback;
}

export function groupByGraduationYear(profiles: AlumniProfile[]) {
  const grouped = new Map<string, number>();
  profiles.forEach((profile) => {
    const year = profile.graduation_year ? String(profile.graduation_year) : "Unknown";
    grouped.set(year, (grouped.get(year) || 0) + 1);
  });
  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function groupByDegree(profiles: AlumniProfile[]) {
  const grouped = new Map<string, number>();
  profiles.forEach((profile) => {
    const degree = normalizeLabel(profile.degree);
    grouped.set(degree, (grouped.get(degree) || 0) + 1);
  });
  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function certificationDistribution(details: AlumniFullProfile[]) {
  const grouped = new Map<string, number>();
  details.forEach((entry) => {
    entry.certifications.forEach((cert) => {
      const provider = normalizeLabel(cert.provider);
      grouped.set(provider, (grouped.get(provider) || 0) + 1);
    });
  });
  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function topCertificationSkills(details: AlumniFullProfile[]) {
  const grouped = new Map<string, number>();
  details.forEach((entry) => {
    entry.certifications.forEach((cert) => {
      const name = normalizeLabel(cert.name);
      grouped.set(name, (grouped.get(name) || 0) + 1);
    });
  });
  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function employmentTrends(details: AlumniFullProfile[]) {
  const grouped = new Map<string, number>();
  details.forEach((entry) => {
    entry.employmentHistory.forEach((job) => {
      const year = new Date(job.start_date).getFullYear();
      if (!Number.isNaN(year)) {
        const key = String(year);
        grouped.set(key, (grouped.get(key) || 0) + 1);
      }
    });
  });
  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function biddingActivityChartData(bids: BidRecord[]) {
  const grouped = new Map<string, number>();
  bids.forEach((bid) => {
    const date = new Date(bid.created_at).toISOString().split("T")[0] || "Unknown";
    grouped.set(date, (grouped.get(date) || 0) + 1);
  });
  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
