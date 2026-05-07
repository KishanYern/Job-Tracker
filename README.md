# Job Tracker

A modern Next.js web app for tracking your job applications from GitHub job boards.

## Features

- **Auto-scrape** job listings from GitHub repos (SimplifyJobs, pittcsc, Ouckah, jobright-ai)
- **Browse & filter** jobs by type (internship / new-grad), company, and location
- **Mark as Applied** — instantly moves the job to the Applied tab
- **Track statuses** — Applied → Phone Screen → Interview → Offer / Rejected
- **Add notes** to any application
- **Dashboard** with live funnel stats and recent activity feed

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Go to **Jobs** and click **Refresh from GitHub** to scrape the latest listings
2. Click **Open** to review a posting, then **Applied** once you've submitted
3. Go to **Applied**, click the chevron on any card to update status and add notes
4. Check the **Dashboard** for your funnel stats

## Data Storage

Jobs and applications are stored locally in `data/tracker.db` (SQLite). The `data/` folder is gitignored.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS (v4)
- better-sqlite3
- lucide-react
