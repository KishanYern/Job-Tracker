"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { Application, ApplicationStatus } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { formatDate } from "@/lib/utils";

interface Props {
  app: Application;
  onClick: () => void;
}

export default function ApplicationCard({ app, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#16161f",
        border: "1px solid #1f1f2e",
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "border-color 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#2d2d42";
        (e.currentTarget as HTMLElement).style.background = "#1a1a25";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#1f1f2e";
        (e.currentTarget as HTMLElement).style.background = "#16161f";
      }}
    >
      {/* Company avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "linear-gradient(135deg, #312e81, #4c1d95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 16,
          color: "#a5b4fc",
          flexShrink: 0,
        }}
      >
        {app.company.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f8" }}>
            {app.company}
          </span>
          <StatusBadge status={app.status as ApplicationStatus} size="sm" />
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#8b8ba8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {app.role}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
          {app.location && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#555570" }}>
              <MapPin size={10} />
              {app.location}
            </span>
          )}
          <span style={{ fontSize: 11, color: "#555570" }}>
            Applied {formatDate(app.applied_date)}
          </span>
        </div>
      </div>

      {/* Right: open link + chevron hint */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <a
          href={app.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: "#555570", display: "flex", alignItems: "center", padding: 4 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#8b8ba8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555570")}
        >
          <ExternalLink size={14} />
        </a>
        <span style={{ fontSize: 11, color: "#3d3d55" }}>Edit →</span>
      </div>
    </div>
  );
}
