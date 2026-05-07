import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { normalizeLocation } from "@/lib/scraper";

// Common US locations to always include as suggestions even before any scraping
const SEED_LOCATIONS = [
  "Remote",
  "New York, NY",
  "San Francisco, CA",
  "Seattle, WA",
  "Austin, TX",
  "Chicago, IL",
  "Boston, MA",
  "Los Angeles, CA",
  "Washington, DC",
  "Atlanta, GA",
  "Denver, CO",
  "San Jose, CA",
  "Dallas, TX",
  "Houston, TX",
  "Raleigh, NC",
  "Pittsburgh, PA",
  "Philadelphia, PA",
  "Minneapolis, MN",
  "Indianapolis, IN",
  "Milwaukee, WI",
  "Portland, OR",
  "Salt Lake City, UT",
  "Menlo Park, CA",
  "Redmond, WA",
  "Cupertino, CA",
  "Mountain View, CA",
  "Palo Alto, CA",
  "Champaign, IL",
  "Peoria, IL",
  "Columbus, OH",
  "Cincinnati, OH",
  "Cleveland, OH",
  "Detroit, MI",
  "Ann Arbor, MI",
  "St. Louis, MO",
  "Kansas City, MO",
  "Nashville, TN",
  "Charlotte, NC",
  "Miami, FL",
  "Tampa, FL",
  "Orlando, FL",
  "San Diego, CA",
  "Phoenix, AZ",
  "Las Vegas, NV",
  "New York City, NY",
  "Brooklyn, NY",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() ?? "";

    const db = getDb();

    // Pull distinct non-empty locations from the jobs table
    const rows = db
      .prepare(
        `SELECT DISTINCT location FROM jobs
         WHERE location != ''
         ORDER BY location ASC`
      )
      .all() as { location: string }[];

    const NON_USA = [
      "canada", "europe", "uk", "united kingdom", "australia",
      "india", "germany", "france", "netherlands", "singapore",
      "japan", "china", "brazil", "mexico", "israel", "ireland",
    ];
    // Accept "Remote", "City, ST", or "City" (no state) — but not concatenated blobs
    const CLEAN_LOCATION = /^(Remote|[A-Z][a-zA-Z\s.'-]+(,\s*[A-Z]{2})?)$/;

    const dbLocations = rows
      .map((r) => normalizeLocation(r.location.trim()))
      .filter((loc) => {
        if (!loc || /^\d/.test(loc)) return false;
        if (loc.length > 50) return false;
        const lower = loc.toLowerCase();
        if (NON_USA.some((kw) => lower.includes(kw))) return false;
        // Only accept clean single-location strings
        if (!CLEAN_LOCATION.test(loc)) return false;
        // Catch concatenation artifacts like "RemoteBay Area, CA"
        if (loc.startsWith("Remote") && loc !== "Remote") return false;
        return true;
      });

    // Merge seed + DB locations, deduplicate
    const seen = new Set<string>();
    const all: string[] = [];
    for (const loc of [...SEED_LOCATIONS, ...dbLocations]) {
      const key = loc.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        all.push(loc);
      }
    }

    // Filter by query
    const filtered = q
      ? all.filter((loc) => loc.toLowerCase().includes(q))
      : all;

    return NextResponse.json({ locations: filtered.slice(0, 20) });
  } catch (err) {
    console.error("[GET /api/locations]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
