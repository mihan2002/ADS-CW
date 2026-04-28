import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { requireApiKey } from "../middleware/apiKeyAuth.js";
import { db } from "../db/index.js";
import { alumniProfilesTable, employmentHistoryTable, featureDaysTable, bidsTable } from "../db/schema.js";

const router = Router();

router.get("/alumni", requireApiKey(["read:alumni"]), async (_req, res) => {
  const rows = await db.select().from(alumniProfilesTable);
  res.status(200).json({ success: true, data: rows, message: "Alumni retrieved" });
});

router.get("/analytics", requireApiKey(["read:analytics"]), async (_req, res) => {
  const [profiles, employment] = await Promise.all([
    db.select().from(alumniProfilesTable),
    db.select().from(employmentHistoryTable),
  ]);

  const byDegree: Record<string, number> = {};
  const byGraduationYear: Record<string, number> = {};
  for (const p of profiles) {
    const deg = p.degree ?? "Unknown";
    byDegree[deg] = (byDegree[deg] ?? 0) + 1;
    const y = p.graduation_year ? String(p.graduation_year) : "Unknown";
    byGraduationYear[y] = (byGraduationYear[y] ?? 0) + 1;
  }

  const topJobTitles: Record<string, number> = {};
  const topEmployers: Record<string, number> = {};
  for (const e of employment) {
    topJobTitles[e.job_title] = (topJobTitles[e.job_title] ?? 0) + 1;
    topEmployers[e.company] = (topEmployers[e.company] ?? 0) + 1;
  }

  res.status(200).json({
    success: true,
    data: {
      byDegree,
      byGraduationYear,
      topJobTitles,
      topEmployers,
    },
    message: "Analytics retrieved",
  });
});

router.get("/alumni-of-day", requireApiKey(["read:alumni_of_day"]), async (_req, res) => {
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const slots = await db
    .select()
    .from(featureDaysTable)
    .where(eq(featureDaysTable.day, todayMidnight))
    .limit(1);

  const slot = slots[0] ?? null;
  if (!slot || !slot.winner_user_id) {
    res.status(200).json({ success: true, data: { slot: null }, message: "No featured alumni selected" });
    return;
  }

  const [profile] = await db
    .select()
    .from(alumniProfilesTable)
    .where(eq(alumniProfilesTable.user_id, slot.winner_user_id))
    .limit(1);

  const [winningBid] = slot.winning_bid_id
    ? await db.select().from(bidsTable).where(eq(bidsTable.id, slot.winning_bid_id)).limit(1)
    : [null];

  res.status(200).json({
    success: true,
    data: { slot, profile: profile ?? null, winningBid: winningBid ?? null },
    message: "Featured alumni retrieved",
  });
});

router.get("/usage/me", requireApiKey([]), async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      clientName: req.apiKeyAuth?.clientName ?? null,
      permissions: req.apiKeyAuth?.permissions ?? [],
    },
    message: "API key info",
  });
});

export default router;

