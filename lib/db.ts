import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "tracker.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      company     TEXT    NOT NULL,
      role        TEXT    NOT NULL,
      location    TEXT    NOT NULL DEFAULT '',
      apply_url   TEXT    NOT NULL UNIQUE,
      source_repo TEXT    NOT NULL DEFAULT '',
      job_type    TEXT    NOT NULL DEFAULT 'new-grad',
      date_scraped TEXT   NOT NULL,
      is_open     INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS applications (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id       INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      applied_date TEXT    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'applied',
      notes        TEXT    NOT NULL DEFAULT '',
      last_updated TEXT    NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_company    ON jobs(company);
    CREATE INDEX IF NOT EXISTS idx_jobs_job_type   ON jobs(job_type);
    CREATE INDEX IF NOT EXISTS idx_apps_status     ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_apps_job_id     ON applications(job_id);
  `);

  // One-time migration: normalize all "Remote in USA" / "Remote, US" variants → "Remote"
  db.exec(`
    UPDATE jobs SET location = 'Remote' WHERE
      lower(location) = 'remote' OR
      lower(location) = 'remote in usa' OR
      lower(location) = 'remote in us' OR
      lower(location) = 'remote, us' OR
      lower(location) = 'remote, usa' OR
      lower(location) = 'remote (us)' OR
      lower(location) = 'remote (usa)' OR
      lower(location) = 'remote (us only)' OR
      lower(location) = 'remote - us' OR
      lower(location) = 'remote - usa' OR
      lower(location) = 'remote / us' OR
      lower(location) = 'remote / usa' OR
      lower(location) = 'us remote' OR
      lower(location) = 'usa remote' OR
      lower(location) = 'remote only' OR
      lower(location) = 'fully remote' OR
      lower(location) LIKE 'remote - united states%' OR
      lower(location) LIKE 'remote in united states%' OR
      lower(location) LIKE 'remote, united states%' OR
      lower(location) LIKE 'remote (united states%';
  `);
}
