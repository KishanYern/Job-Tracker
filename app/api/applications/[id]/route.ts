import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ApplicationStatus } from "@/lib/types";

const VALID_STATUSES: ApplicationStatus[] = [
  "applied",
  "oa",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body as {
      status?: ApplicationStatus;
      notes?: string;
    };

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM applications WHERE id = ?")
      .get(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const updates: string[] = ["last_updated = ?"];
    const values: (string | number)[] = [now];

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }
    values.push(id);

    db.prepare(
      `UPDATE applications SET ${updates.join(", ")} WHERE id = ?`
    ).run(...values);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/applications/[id]]", err);
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
    db.prepare("DELETE FROM applications WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/applications/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
