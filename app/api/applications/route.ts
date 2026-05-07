import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const db = getDb();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status && status !== "all") {
      conditions.push("a.status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push("(j.company LIKE ? OR j.role LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const applications = db
      .prepare(
        `SELECT
          a.id, a.job_id, a.applied_date, a.status, a.notes, a.last_updated,
          j.company, j.role, j.location, j.apply_url, j.source_repo, j.job_type
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         ${where}
         ORDER BY a.applied_date DESC`
      )
      .all(...params);

    return NextResponse.json({ applications });
  } catch (err) {
    console.error("[GET /api/applications]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
