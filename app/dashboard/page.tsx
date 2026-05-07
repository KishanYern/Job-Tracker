"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle,
  ClipboardList,
  Phone,
  Users,
  Trophy,
  XCircle,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import { ApplicationStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface StatsData {
  total_scraped: number;
  applied: number;
  oa: number;
  phone_screen: number;
  interview: number;
  offers: number;
  rejected: number;
  recent_activity: {
    id: number;
    status: ApplicationStatus;
    applied_date: string;
    last_updated: string;
    company: string;
    role: string;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      const data: StatsData = await res.json();
      setStats(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  const totalApps = stats
    ? stats.applied + stats.oa + stats.phone_screen + stats.interview + stats.offers + stats.rejected
    : 0;

  const responseRate =
    totalApps > 0 && stats
      ? Math.round(
          ((stats.oa + stats.phone_screen + stats.interview + stats.offers) / totalApps) * 100
        )
      : 0;

  const offerRate =
    totalApps > 0 && stats
      ? Math.round((stats.offers / totalApps) * 100)
      : 0;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
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
            Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8b8ba8" }}>
            Your job search at a glance
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#8b8ba8",
            background: "#1e1e2a",
            border: "1px solid #2a2a3d",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw
            size={13}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <StatsCard
          label="Jobs Scraped"
          value={stats?.total_scraped ?? 0}
          icon={Briefcase}
          color="#6366f1"
          bgColor="rgba(99,102,241,0.12)"
          borderColor="rgba(99,102,241,0.2)"
          sub="Available to apply"
        />
        <StatsCard
          label="Applied"
          value={stats?.applied ?? 0}
          icon={CheckCircle}
          color="#3b82f6"
          bgColor="rgba(59,130,246,0.12)"
          borderColor="rgba(59,130,246,0.2)"
        />
        <StatsCard
          label="Online Assessment"
          value={stats?.oa ?? 0}
          icon={ClipboardList}
          color="#f97316"
          bgColor="rgba(249,115,22,0.12)"
          borderColor="rgba(249,115,22,0.2)"
        />
        <StatsCard
          label="Phone Screen"
          value={stats?.phone_screen ?? 0}
          icon={Phone}
          color="#eab308"
          bgColor="rgba(234,179,8,0.12)"
          borderColor="rgba(234,179,8,0.2)"
        />
        <StatsCard
          label="Interviewing"
          value={stats?.interview ?? 0}
          icon={Users}
          color="#a855f7"
          bgColor="rgba(168,85,247,0.12)"
          borderColor="rgba(168,85,247,0.2)"
        />
        <StatsCard
          label="Offers"
          value={stats?.offers ?? 0}
          icon={Trophy}
          color="#22c55e"
          bgColor="rgba(34,197,94,0.12)"
          borderColor="rgba(34,197,94,0.2)"
        />
        <StatsCard
          label="Rejected"
          value={stats?.rejected ?? 0}
          icon={XCircle}
          color="#ef4444"
          bgColor="rgba(239,68,68,0.1)"
          borderColor="rgba(239,68,68,0.2)"
        />
      </div>

      {/* Heatmap */}
      <div style={{ marginBottom: 16 }}>
        <HeatmapCalendar />
      </div>

      {/* Two-col: funnel + activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Funnel / rates */}
        <div
          style={{
            background: "#16161f",
            border: "1px solid #1f1f2e",
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 15,
              fontWeight: 600,
              color: "#f0f0f8",
            }}
          >
            Application Funnel
          </h2>

          {totalApps === 0 ? (
            <p style={{ color: "#555570", fontSize: 13, margin: 0 }}>
              No applications yet. Start applying!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  label: "Applied",
                  value: totalApps,
                  color: "#3b82f6",
                  pct: 100,
                },
                {
                  label: "Responded",
                  value: stats
                    ? stats.phone_screen + stats.interview + stats.offers
                    : 0,
                  color: "#eab308",
                  pct: responseRate,
                },
                {
                  label: "Interviewing",
                  value: stats ? stats.interview + stats.offers : 0,
                  color: "#a855f7",
                  pct:
                    totalApps > 0 && stats
                      ? Math.round(
                          ((stats.interview + stats.offers) / totalApps) * 100
                        )
                      : 0,
                },
                {
                  label: "Offers",
                  value: stats?.offers ?? 0,
                  color: "#22c55e",
                  pct: offerRate,
                },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: "#8b8ba8" }}>{label}</span>
                    <span style={{ color: "#f0f0f8", fontWeight: 600 }}>
                      {value}{" "}
                      <span style={{ color: "#555570", fontWeight: 400 }}>
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "#1e1e2a",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div
          style={{
            background: "#16161f",
            border: "1px solid #1f1f2e",
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f0f0f8" }}>
              Recent Activity
            </h2>
            <Link
              href="/applied"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "#6366f1",
                textDecoration: "none",
              }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!stats || stats.recent_activity.length === 0 ? (
            <p style={{ color: "#555570", fontSize: 13, margin: 0 }}>
              No recent activity yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.recent_activity.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    background: "#13131c",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "#1e1e2a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#8b8ba8",
                      flexShrink: 0,
                    }}
                  >
                    {item.company.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#f0f0f8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.company}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "#555570",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.role}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <StatusBadge status={item.status} size="sm" />
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 10,
                        color: "#555570",
                      }}
                    >
                      <Clock size={9} />
                      {formatDate(item.last_updated)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 16,
        }}
      >
        <Link
          href="/jobs"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.1))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 12,
            textDecoration: "none",
            transition: "border-color 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.2)")
          }
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#a5b4fc" }}>
              Browse Jobs
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555570" }}>
              {stats?.total_scraped ?? 0} listings available
            </p>
          </div>
          <ArrowRight size={18} color="#6366f1" />
        </Link>

        <Link
          href="/applied"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 12,
            textDecoration: "none",
            transition: "border-color 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.2)")
          }
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#60a5fa" }}>
              View Applications
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555570" }}>
              {totalApps} tracked
            </p>
          </div>
          <ArrowRight size={18} color="#3b82f6" />
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
