import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const job = db.prepare("SELECT id FROM jobs WHERE id = ?").get(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const existing = db
      .prepare("SELECT id FROM applications WHERE job_id = ?")
      .get(id);
    if (existing) {
      return NextResponse.json(
        { error: "Already applied" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const result = db
      .prepare(
        `INSERT INTO applications (job_id, applied_date, status, notes, last_updated)
         VALUES (?, ?, 'applied', '', ?)`
      )
      .run(id, now, now);

    return NextResponse.json({ application_id: result.lastInsertRowid });
  } catch (err) {
    console.error("[PATCH /api/jobs/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/jobs/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
