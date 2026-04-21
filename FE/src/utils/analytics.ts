import type { AlumniProfile, FullAlumniProfile, Bid } from '@/types';

// ─── 1. Alumni by Graduation Year (Bar chart) ────────────────────────────────
export function groupByGraduationYear(
  profiles: AlumniProfile[],
): { year: number; count: number }[] {
  const map: Record<number, number> = {};
  profiles.forEach((p) => {
    if (p.graduation_year) {
      map[p.graduation_year] = (map[p.graduation_year] || 0) + 1;
    }
  });
  return Object.entries(map)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);
}

// ─── 2. Alumni by Degree (Pie chart) ─────────────────────────────────────────
export function groupByDegree(
  profiles: AlumniProfile[],
): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  profiles.forEach((p) => {
    const degree = p.degree || 'Unspecified';
    map[degree] = (map[degree] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── 3. Certifications Distribution by Provider (Bar chart) ──────────────────
export function countCertificationsByProvider(
  profiles: FullAlumniProfile[],
): { provider: string; count: number }[] {
  const map: Record<string, number> = {};
  profiles.forEach((p) => {
    p.certifications.forEach((c) => {
      map[c.provider] = (map[c.provider] || 0) + 1;
    });
  });
  return Object.entries(map)
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ─── 4. Employment Trends (Line chart — new positions per year) ──────────────
export function analyzeEmploymentTrends(
  profiles: FullAlumniProfile[],
): { year: number; newPositions: number }[] {
  const map: Record<number, number> = {};
  profiles.forEach((p) => {
    p.employmentHistory.forEach((e) => {
      const year = new Date(e.start_date).getFullYear();
      if (!isNaN(year)) {
        map[year] = (map[year] || 0) + 1;
      }
    });
  });
  return Object.entries(map)
    .map(([year, newPositions]) => ({ year: Number(year), newPositions }))
    .sort((a, b) => a.year - b.year);
}

// ─── 5. Top Certifications (Doughnut/Donut chart) ────────────────────────────
export function getTopCertifications(
  profiles: FullAlumniProfile[],
  limit = 8,
): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  profiles.forEach((p) => {
    p.certifications.forEach((c) => {
      map[c.name] = (map[c.name] || 0) + 1;
    });
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

// ─── 6. Bidding Activity (Line/Bar chart) ────────────────────────────────────
export function analyzeBiddingActivity(
  bids: Bid[],
): { date: string; count: number; totalAmount: number }[] {
  const map: Record<string, { count: number; totalAmount: number }> = {};
  bids.forEach((b) => {
    const date = b.created_at.split('T')[0];
    if (!map[date]) {
      map[date] = { count: 0, totalAmount: 0 };
    }
    map[date].count += 1;
    map[date].totalAmount += parseFloat(b.amount);
  });
  return Object.entries(map)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── 7. Appearance Count Distribution (Bar chart) ────────────────────────────
export function getAppearanceDistribution(
  profiles: AlumniProfile[],
): { range: string; count: number }[] {
  const ranges = [
    { label: '0', min: 0, max: 0 },
    { label: '1-2', min: 1, max: 2 },
    { label: '3-5', min: 3, max: 5 },
    { label: '6-10', min: 6, max: 10 },
    { label: '10+', min: 11, max: Infinity },
  ];

  return ranges.map(({ label, min, max }) => ({
    range: label,
    count: profiles.filter((p) => {
      const count = p.appearance_count ?? 0;
      return count >= min && count <= max;
    }).length,
  }));
}

// ─── 8. Top Companies (Horizontal Bar chart) ────────────────────────────────
export function getTopCompanies(
  profiles: FullAlumniProfile[],
  limit = 10,
): { company: string; count: number }[] {
  const map: Record<string, number> = {};
  profiles.forEach((p) => {
    p.employmentHistory.forEach((e) => {
      map[e.company] = (map[e.company] || 0) + 1;
    });
  });
  return Object.entries(map)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ─── Filtering helpers ──────────────────────────────────────────────────────
export function filterByGraduationYearRange(
  profiles: AlumniProfile[],
  start: number,
  end: number,
): AlumniProfile[] {
  return profiles.filter(
    (p) => p.graduation_year && p.graduation_year >= start && p.graduation_year <= end,
  );
}

export function searchAlumni(
  profiles: AlumniProfile[],
  query: string,
): AlumniProfile[] {
  const q = query.toLowerCase().trim();
  if (!q) return profiles;
  return profiles.filter(
    (p) =>
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      (p.degree && p.degree.toLowerCase().includes(q)) ||
      (p.current_position && p.current_position.toLowerCase().includes(q)),
  );
}

// ─── Summary stats ──────────────────────────────────────────────────────────
export function computeOverviewStats(
  profiles: AlumniProfile[],
  fullProfiles: FullAlumniProfile[],
) {
  const totalAlumni = profiles.length;
  const totalCertifications = fullProfiles.reduce(
    (acc, p) => acc + p.certifications.length,
    0,
  );
  const totalDegrees = fullProfiles.reduce(
    (acc, p) => acc + p.degrees.length,
    0,
  );
  const totalEmploymentRecords = fullProfiles.reduce(
    (acc, p) => acc + p.employmentHistory.length,
    0,
  );

  return { totalAlumni, totalCertifications, totalDegrees, totalEmploymentRecords };
}
