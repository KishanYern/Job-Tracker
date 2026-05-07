"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle, MapPin, Building2, Tag, X } from "lucide-react";
import { Job } from "@/lib/types";

interface Props {
  job: Job;
  onApplied: (jobId: number) => void;
  onDismiss: (jobId: number) => void;
}

export default function JobCard({ job, onApplied, onDismiss }: Props) {
  const [applying, setApplying] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  async function handleMarkApplied() {
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "PATCH" });
      if (res.ok) {
        onApplied(job.id);
      }
    } finally {
      setApplying(false);
    }
  }

  async function handleDismiss() {
    setDismissing(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (res.ok) {
        onDismiss(job.id);
      }
    } finally {
      setDismissing(false);
    }
  }

  const jobTypeBg =
    job.job_type === "internship"
      ? { bg: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "rgba(99,102,241,0.25)" }
      : { bg: "rgba(20,184,166,0.12)", color: "#5eead4", border: "rgba(20,184,166,0.25)" };

  return (
    <div
      style={{
        background: "#16161f",
        border: "1px solid #1f1f2e",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#2d2d42";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#1f1f2e";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Building2 size={14} color="#6366f1" />
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#f0f0f8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {job.company}
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#c4c4d8",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {job.role}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          disabled={dismissing}
          title="Dismiss"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#555570",
            padding: 4,
            borderRadius: 4,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555570")}
        >
          <X size={14} />
        </button>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {job.location && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#8b8ba8",
              background: "#1e1e2a",
              border: "1px solid #2a2a3d",
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            <MapPin size={11} />
            {job.location.length > 30 ? job.location.slice(0, 30) + "…" : job.location}
          </span>
        )}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: jobTypeBg.color,
            background: jobTypeBg.bg,
            border: `1px solid ${jobTypeBg.border}`,
            borderRadius: 6,
            padding: "3px 8px",
          }}
        >
          <Tag size={11} />
          {job.job_type === "internship" ? "Internship" : "New Grad"}
        </span>
      </div>

      {/* Source */}
      <p style={{ margin: 0, fontSize: 11, color: "#555570" }}>
        via {job.source_repo}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
            border: "none",
            borderRadius: 8,
            padding: "7px 14px",
            textDecoration: "none",
            flex: 2,
            justifyContent: "center",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          <ExternalLink size={13} />
          Open
        </a>
        <button
          onClick={handleMarkApplied}
          disabled={applying}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: applying ? "#555570" : "#8b8ba8",
            background: "#1e1e2a",
            border: "1px solid #2a2a3d",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: applying ? "not-allowed" : "pointer",
            flex: 1,
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!applying) {
              (e.currentTarget as HTMLElement).style.color = "#4ade80";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!applying) {
              (e.currentTarget as HTMLElement).style.color = "#8b8ba8";
              (e.currentTarget as HTMLElement).style.borderColor = "#2a2a3d";
            }
          }}
        >
          <CheckCircle size={13} />
          {applying ? "Saving…" : "Applied"}
        </button>
      </div>
    </div>
  );
}
