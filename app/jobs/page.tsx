"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, Briefcase, AlertCircle, CheckCheck } from "lucide-react";
import { Job } from "@/lib/types";
import JobCard from "@/components/JobCard";
import FilterBar, { JobFilters } from "@/components/FilterBar";

interface FetchResult {
  jobs: Job[];
  total: number;
}

interface ScrapeResult {
  added: number;
  skipped: number;
  total: number;
  repos: { repo: string; count: number }[];
  error?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<JobFilters>({
    jobType: "all",
    company: "",
    locations: [],
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchJobs = useCallback(
    async (currentFilters: JobFilters, currentPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: "48",
        });
        if (currentFilters.jobType !== "all") {
          params.set("job_type", currentFilters.jobType);
        }
        if (currentFilters.company) params.set("company", currentFilters.company);
        for (const loc of currentFilters.locations) {
          params.append("location", loc);
        }

        const res = await fetch(`/api/jobs?${params}`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data: FetchResult = await res.json();
        setJobs(data.jobs);
        setTotal(data.total);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleFiltersChange(newFilters: JobFilters) {
    setFilters(newFilters);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs(newFilters, 1);
    }, 300);
  }

  async function handleScrape() {
    setScraping(true);
    setScrapeResult(null);
    setError(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data: ScrapeResult = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scrape failed");
      setScrapeResult(data);
      await fetchJobs(filters, 1);
      setPage(1);
    } catch (e) {
      setError(String(e));
    } finally {
      setScraping(false);
    }
  }

  function handleApplied(jobId: number) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setTotal((t) => t - 1);
  }

  function handleDismiss(jobId: number) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setTotal((t) => t - 1);
  }

  const totalPages = Math.ceil(total / 48);

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: "#f0f0f8",
              letterSpacing: "-0.03em",
            }}
          >
            Job Listings
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8b8ba8" }}>
            Browse scraped listings from GitHub job boards
          </p>
        </div>
        <button
          onClick={handleScrape}
          disabled={scraping}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "white",
            background: scraping
              ? "#1e1e2a"
              : "linear-gradient(135deg, #6366f1, #7c3aed)",
            border: scraping ? "1px solid #2a2a3d" : "none",
            borderRadius: 10,
            padding: "10px 20px",
            cursor: scraping ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!scraping)
              (e.currentTarget as HTMLElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          <RefreshCw
            size={15}
            style={{
              animation: scraping ? "spin 1s linear infinite" : "none",
            }}
          />
          {scraping ? "Scraping GitHub…" : "Refresh from GitHub"}
        </button>
      </div>

      {/* Scrape result banner */}
      {scrapeResult && (
        <div
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#4ade80",
          }}
        >
          <CheckCheck size={15} />
          <span>
            Scraped {scrapeResult.total.toLocaleString()} jobs across{" "}
            {scrapeResult.repos.length} repos — {scrapeResult.added} new,{" "}
            {scrapeResult.skipped} already tracked
          </span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#f87171",
          }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Filters */}
      <FilterBar
        filters={filters}
        onChange={handleFiltersChange}
        totalShown={jobs.length}
        totalAll={total}
      />

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "#16161f",
                border: "1px solid #1f1f2e",
                borderRadius: 12,
                padding: 20,
                height: 180,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            gap: 14,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#1e1e2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Briefcase size={28} color="#3d3d55" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#8b8ba8" }}>
              No jobs found
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#555570" }}>
              Click &ldquo;Refresh from GitHub&rdquo; to scrape the latest listings
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 14,
            }}
          >
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApplied={handleApplied}
                onDismiss={handleDismiss}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                marginTop: 32,
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={paginationBtnStyle(page === 1)}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: "#8b8ba8" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={paginationBtnStyle(page === totalPages)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function paginationBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    fontSize: 13,
    fontWeight: 500,
    color: disabled ? "#3d3d55" : "#8b8ba8",
    background: "#1e1e2a",
    border: "1px solid #2a2a3d",
    borderRadius: 8,
    padding: "7px 16px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
