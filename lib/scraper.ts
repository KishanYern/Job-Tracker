import { JobType } from "./types";

export interface JobListing {
  company: string;
  role: string;
  location: string;
  apply_url: string;
  source_repo: string;
  job_type: JobType;
}

interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  readme_path: string;
  job_type: JobType;
}

const DEFAULT_REPOS: RepoConfig[] = [
  {
    owner: "SimplifyJobs",
    repo: "Summer2026-Internships",
    branch: "dev",
    readme_path: "README.md",
    job_type: "internship",
  },
  {
    owner: "SimplifyJobs",
    repo: "New-Grad-Positions",
    branch: "dev",
    readme_path: "README.md",
    job_type: "new-grad",
  },
  {
    owner: "pittcsc",
    repo: "Summer2026-Internships",
    branch: "dev",
    readme_path: "README.md",
    job_type: "internship",
  },
  {
    owner: "Ouckah",
    repo: "Summer2025-Internships",
    branch: "dev",
    readme_path: "README.md",
    job_type: "internship",
  },
  {
    owner: "jobright-ai",
    repo: "2026-Software-Engineer-New-Grad",
    branch: "main",
    readme_path: "README.md",
    job_type: "new-grad",
  },
];

function rawUrl(repo: RepoConfig): string {
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/${repo.readme_path}`;
}

function displayName(repo: RepoConfig): string {
  return `${repo.owner}/${repo.repo}`;
}

function cleanCell(cell: string): string {
  cell = cell.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  cell = cell.replace(/[*_~`]/g, "");
  cell = cell.replace(/<[^>]+>/g, "");
  cell = cell.replace(/[^\x00-\x7F]/g, "").trim();
  return cell;
}

function extractUrl(cell: string): string | null {
  const mdMatch = cell.match(/\[([^\]]*)\]\(([^)]+)\)/);
  if (mdMatch) return mdMatch[2].trim();
  const urlMatch = cell.match(/https?:\/\/[^\s<>"')]+/);
  if (urlMatch) return urlMatch[0].trim();
  return null;
}

function extractJobUrlFromHtml(cell: string): string | null {
  const allUrls = [...cell.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)].map(
    (m) => m[1]
  );
  for (const url of allUrls) {
    if (!url.toLowerCase().includes("simplify.jobs") && url.startsWith("http")) {
      return url.split("?utm_source=")[0];
    }
  }
  return allUrls[0] ?? null;
}

const SKIP_URL_PATTERNS = [
  "github.com",
  "linkedin.com/company",
  "twitter.com",
  "simplify.jobs/p/",
];

function shouldSkipUrl(url: string): boolean {
  return SKIP_URL_PATTERNS.some((p) => url.toLowerCase().includes(p));
}

// Keywords that unambiguously identify a non-USA location
const NON_USA_KEYWORDS = [
  "uk", "united kingdom", "england", "scotland", "wales", "london", "manchester",
  "edinburgh", "bristol", "birmingham",
  "canada", "toronto", "vancouver", "montreal", "ottawa", "calgary", "quebec",
  "australia", "sydney", "melbourne", "brisbane", "perth", "canberra",
  "india", "bangalore", "bengaluru", "mumbai", "hyderabad", "delhi", "chennai", "pune",
  "germany", "berlin", "munich", "hamburg", "frankfurt",
  "france", "paris", "lyon",
  "netherlands", "amsterdam",
  "sweden", "stockholm",
  "norway", "oslo",
  "denmark", "copenhagen",
  "finland", "helsinki",
  "switzerland", "zurich", "geneva",
  "austria", "vienna",
  "belgium", "brussels",
  "poland", "warsaw",
  "spain", "madrid", "barcelona",
  "italy", "rome", "milan",
  "portugal", "lisbon",
  "ireland", "dublin",
  "israel", "tel aviv",
  "singapore",
  "japan", "tokyo",
  "china", "beijing", "shanghai", "shenzhen",
  "hong kong",
  "south korea", "seoul",
  "taiwan", "taipei",
  "brazil", "sao paulo",
  "mexico", "mexico city",
  "new zealand", "auckland",
  "south africa", "johannesburg",
  "europe", " eu ", "emea",
];

function isNonUSA(location: string): boolean {
  if (!location) return false;
  const lower = ` ${location.toLowerCase()} `;
  return NON_USA_KEYWORDS.some((kw) => lower.includes(` ${kw} `) || lower.includes(` ${kw},`) || lower.includes(`,${kw} `) || lower.endsWith(` ${kw}`));
}

// Normalize various "Remote" variants to a clean canonical string
const REMOTE_PATTERNS = [
  /^remote[\s,\-–]*(in\s+)?(usa?|united\s+states?|us only|anywhere)[\s,]*/i,
  /^(usa?|united\s+states?|us)\s*[\-–,]?\s*remote/i,
  /^remote$/i,
  /^remote\s*\(us(a?)(\s+only)?\)/i,
  /^remote\s*\/\s*usa?/i,
];

export function normalizeLocation(raw: string): string {
  const trimmed = raw.trim();
  for (const pattern of REMOTE_PATTERNS) {
    if (pattern.test(trimmed)) return "Remote";
  }
  return trimmed;
}

function parseMarkdownTable(content: string, repo: RepoConfig): JobListing[] {
  const listings: JobListing[] = [];
  const lines = content.split("\n");
  let inTable = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^\|[\s\-:|]+\|$/.test(line)) {
      inTable = true;
      continue;
    }
    if (!line.startsWith("|")) {
      inTable = false;
      continue;
    }
    if (!inTable) continue;

    const match = line.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*/);
    if (!match) continue;

    const company = cleanCell(match[1]);
    const role = cleanCell(match[2]);
    const location = cleanCell(match[3]);
    const linkCell = match[4];

    if (line.includes("~~") || line.includes("🔒") || line.toLowerCase().includes("closed")) continue;
    if (!company || company === "↳") continue;

    const apply_url = extractUrl(linkCell);
    if (!apply_url || shouldSkipUrl(apply_url)) continue;

    const normalizedLocation = normalizeLocation(location);
    if (isNonUSA(normalizedLocation)) continue;

    listings.push({ company, role, location: normalizedLocation, apply_url, source_repo: displayName(repo), job_type: repo.job_type });
  }
  return listings;
}

function parseHtmlTable(content: string, repo: RepoConfig): JobListing[] {
  const listings: JobListing[] = [];
  const rowPattern = /<tr>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/gi;

  for (const match of content.matchAll(rowPattern)) {
    const [fullRow, companyCell, roleCell, locationCell, linkCell] = match;
    if (companyCell.includes("↳")) continue;
    if (fullRow.includes("🔒")) continue;

    const company = cleanCell(companyCell);
    const role = cleanCell(roleCell);
    const location = cleanCell(locationCell);

    if (!company || company === "↳") continue;

    const apply_url = extractJobUrlFromHtml(linkCell);
    if (!apply_url || shouldSkipUrl(apply_url)) continue;

    const normalizedLocation = normalizeLocation(location);
    if (isNonUSA(normalizedLocation)) continue;

    listings.push({ company, role, location: normalizedLocation, apply_url, source_repo: displayName(repo), job_type: repo.job_type });
  }
  return listings;
}

async function scrapeRepo(repo: RepoConfig): Promise<JobListing[]> {
  try {
    const res = await fetch(rawUrl(repo), { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const content = await res.text();

    let listings = parseMarkdownTable(content, repo);
    if (listings.length === 0 && content.toLowerCase().includes("<table")) {
      listings = parseHtmlTable(content, repo);
    }
    return listings;
  } catch {
    return [];
  }
}

export async function scrapeAllRepos(): Promise<{
  listings: JobListing[];
  reposSummary: { repo: string; count: number }[];
}> {
  const results = await Promise.allSettled(DEFAULT_REPOS.map(scrapeRepo));
  const reposSummary: { repo: string; count: number }[] = [];
  const seen = new Set<string>();
  const listings: JobListing[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const repo = DEFAULT_REPOS[i];
    if (result.status === "fulfilled") {
      let count = 0;
      for (const job of result.value) {
        if (!seen.has(job.apply_url)) {
          seen.add(job.apply_url);
          listings.push(job);
          count++;
        }
      }
      reposSummary.push({ repo: displayName(repo), count });
    } else {
      reposSummary.push({ repo: displayName(repo), count: 0 });
    }
  }

  return { listings, reposSummary };
}
