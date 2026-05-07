export type JobType = "internship" | "new-grad";
export type ApplicationStatus =
  | "applied"
  | "oa"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected";

export interface Job {
  id: number;
  company: string;
  role: string;
  location: string;
  apply_url: string;
  source_repo: string;
  job_type: JobType;
  date_scraped: string;
  is_open: number;
}

export interface Application {
  id: number;
  job_id: number;
  applied_date: string;
  status: ApplicationStatus;
  notes: string;
  last_updated: string;
  company: string;
  role: string;
  location: string;
  apply_url: string;
  source_repo: string;
  job_type: JobType;
}

export interface Stats {
  total_scraped: number;
  applied: number;
  oa: number;
  phone_screen: number;
  interview: number;
  offers: number;
  rejected: number;
}

export interface ScrapeResult {
  added: number;
  skipped: number;
  total: number;
  repos: string[];
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  oa: "Online Assessment",
  phone_screen: "Phone Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "#3b82f6",
  oa: "#f97316",
  phone_screen: "#eab308",
  interview: "#a855f7",
  offer: "#22c55e",
  rejected: "#ef4444",
};
