import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { scrapeAllRepos } from "@/lib/scraper";

export async function POST() {
  try {
    const { listings, reposSummary } = await scrapeAllRepos();
    const db = getDb();

    const insert = db.prepare(`
      INSERT INTO jobs (company, role, location, apply_url, source_repo, job_type, date_scraped, is_open)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(apply_url) DO UPDATE SET
        is_open = 1,
        date_scraped = excluded.date_scraped
    `);

    let added = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    const upsertMany = db.transaction(() => {
      for (const job of listings) {
        const existing = db
          .prepare("SELECT id FROM jobs WHERE apply_url = ?")
          .get(job.apply_url);
        if (existing) {
          skipped++;
        } else {
          added++;
        }
        insert.run(
          job.company,
          job.role,
          job.location,
          job.apply_url,
          job.source_repo,
          job.job_type,
          now
        );
      }
    });

    upsertMany();

    return NextResponse.json({
      added,
      skipped,
      total: listings.length,
      repos: reposSummary,
    });
  } catch (err) {
    console.error("[/api/scrape]", err);
    return NextResponse.json(
      { error: "Scraping failed", details: String(err) },
      { status: 500 }
    );
  }
}
