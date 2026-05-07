"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, CheckCircle, AlertCircle } from "lucide-react";
import { Application, ApplicationStatus } from "@/lib/types";
import ApplicationCard from "@/components/ApplicationCard";
import ApplicationModal from "@/components/ApplicationModal";
import StatusBadge from "@/components/StatusBadge";

const STATUS_TABS: { value: "all" | ApplicationStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "oa", label: "OA" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_GROUP_ORDER: ApplicationStatus[] = [
  "applied", "oa", "phone_screen", "interview", "offer", "rejected",
];

interface ApiResponse {
  applications: Application[];
}

export default function AppliedPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | ApplicationStatus>("all");
  const [search, setSearch] = useState("");
  const [modalApp, setModalApp] = useState<Application | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (search) params.set("search", search);
      const res = await fetch(`/api/applications?${params}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data: ApiResponse = await res.json();
      setApplications(data.applications);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const t = setTimeout(fetchApplications, 200);
    return () => clearTimeout(t);
  }, [fetchApplications]);

  function handleUpdated(id: number, status: ApplicationStatus, notes: string) {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, notes, last_updated: new Date().toISOString() } : a
      )
    );
    // Refresh modal app state too
    setModalApp((prev) =>
      prev?.id === id ? { ...prev, status, notes } : prev
    );
  }

  function handleDeleted(id: number) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setModalApp(null);
  }

  // Count by status for tab badges (from all loaded apps, before tab filter)
  const countByStatus = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const displayed =
    activeTab === "all"
      ? applications
      : applications.filter((a) => a.status === activeTab);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: "#f0f0f8",
            letterSpacing: "-0.03em",
          }}
        >
          Applications
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8b8ba8" }}>
          Click any row to update status or add notes
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#555570",
          }}
        />
        <input
          type="text"
          placeholder="Search company or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#16161f",
            border: "1px solid #1f1f2e",
            borderRadius: 10,
            padding: "9px 12px 9px 36px",
            color: "#f0f0f8",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Status tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          flexWrap: "wrap",
          borderBottom: "1px solid #1f1f2e",
          paddingBottom: 12,
        }}
      >
        {STATUS_TABS.map(({ value, label }) => {
          const active = activeTab === value;
          const count =
            value === "all"
              ? applications.length
              : (countByStatus[value] ?? 0);
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#f0f0f8" : "#8b8ba8",
                background: active ? "#1e1e2a" : "transparent",
                border: active ? "1px solid #2a2a3d" : "1px solid transparent",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.color = "#c4c4d8";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.color = "#8b8ba8";
              }}
            >
              {label}
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: active ? "#a5b4fc" : "#555570",
                    background: active ? "rgba(99,102,241,0.2)" : "#1e1e2a",
                    borderRadius: 20,
                    padding: "1px 6px",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
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

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "#16161f",
                border: "1px solid #1f1f2e",
                borderRadius: 12,
                height: 72,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 280,
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
            <CheckCircle size={28} color="#3d3d55" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#8b8ba8" }}>
              No applications yet
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#555570" }}>
              Mark jobs as applied on the Jobs page to track them here
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeTab === "all"
            ? STATUS_GROUP_ORDER.filter((s) => (countByStatus[s] ?? 0) > 0).map((status) => {
                const group = displayed.filter((a) => a.status === status);
                if (group.length === 0) return null;
                return (
                  <div key={status}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                        marginTop: 6,
                      }}
                    >
                      <StatusBadge status={status} />
                      <span style={{ fontSize: 12, color: "#555570" }}>
                        {group.length} {group.length === 1 ? "application" : "applications"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {group.map((app) => (
                        <ApplicationCard
                          key={app.id}
                          app={app}
                          onClick={() => setModalApp(app)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            : displayed.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onClick={() => setModalApp(app)}
                />
              ))}
        </div>
      )}

      {/* Modal */}
      {modalApp && (
        <ApplicationModal
          app={modalApp}
          onClose={() => setModalApp(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
