import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobType = searchParams.get("job_type");
    const company = searchParams.get("company");
    const locations = searchParams.getAll("location"); // multi-value
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = (page - 1) * limit;

    const db = getDb();

    const conditions: string[] = [
      "j.id NOT IN (SELECT job_id FROM applications)",
    ];
    const params: (string | number)[] = [];

    if (jobType && jobType !== "all") {
      conditions.push("j.job_type = ?");
      params.push(jobType);
    }
    if (company) {
      conditions.push("j.company LIKE ?");
      params.push(`%${company}%`);
    }
    if (locations.length > 0) {
      // OR across all supplied location terms
      const locClauses = locations.map(() => "j.location LIKE ?").join(" OR ");
      conditions.push(`(${locClauses})`);
      for (const loc of locations) {
        params.push(`%${loc}%`);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRow = db
      .prepare(`SELECT COUNT(*) as cnt FROM jobs j ${where}`)
      .get(...params) as { cnt: number };

    const jobs = db
      .prepare(
        `SELECT j.* FROM jobs j ${where} ORDER BY j.date_scraped DESC LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    return NextResponse.json({ jobs, total: countRow.cnt, page, limit });
  } catch (err) {
    console.error("[GET /api/jobs]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
