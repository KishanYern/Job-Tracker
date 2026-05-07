import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    // Pull all application dates
    const rows = db
      .prepare(
        `SELECT date(applied_date) as day, COUNT(*) as count
         FROM applications
         GROUP BY day
         ORDER BY day ASC`
      )
      .all() as { day: string; count: number }[];

    return NextResponse.json({ days: rows });
  } catch (err) {
    console.error("[GET /api/stats/heatmap]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
