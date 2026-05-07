import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const totalScraped = (
      db.prepare("SELECT COUNT(*) as cnt FROM jobs").get() as { cnt: number }
    ).cnt;

    const statusCounts = db
      .prepare(
        `SELECT status, COUNT(*) as cnt FROM applications GROUP BY status`
      )
      .all() as { status: string; cnt: number }[];

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = row.cnt;
    }

    const recentActivity = db
      .prepare(
        `SELECT
          a.id, a.status, a.applied_date, a.last_updated,
          j.company, j.role
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         ORDER BY a.last_updated DESC
         LIMIT 10`
      )
      .all();

    return NextResponse.json({
      total_scraped: totalScraped,
      applied: statusMap["applied"] ?? 0,
      oa: statusMap["oa"] ?? 0,
      phone_screen: statusMap["phone_screen"] ?? 0,
      interview: statusMap["interview"] ?? 0,
      offers: statusMap["offer"] ?? 0,
      rejected: statusMap["rejected"] ?? 0,
      recent_activity: recentActivity,
    });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
