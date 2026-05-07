"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, MapPin, Calendar, Trash2, Save } from "lucide-react";
import { Application, ApplicationStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUS_ORDER: ApplicationStatus[] = [
  "applied",
  "oa",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
];

interface Props {
  app: Application;
  onClose: () => void;
  onUpdated: (id: number, status: ApplicationStatus, notes: string) => void;
  onDeleted: (id: number) => void;
}

export default function ApplicationModal({ app, onClose, onUpdated, onDeleted }: Props) {
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [notes, setNotes] = useState(app.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = status !== app.status || notes !== (app.notes ?? "");

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        onUpdated(app.id, status, notes);
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          onClose();
        }, 800);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${app.company} from applied?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(app.id);
        onClose();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal panel */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(520px, calc(100vw - 32px))",
          background: "#16161f",
          border: "1px solid #2a2a3d",
          borderRadius: 16,
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "slideUp 0.18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 22px 18px",
            borderBottom: "1px solid #1f1f2e",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          {/* Company avatar */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #312e81, #4c1d95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 20,
              color: "#a5b4fc",
              flexShrink: 0,
            }}
          >
            {app.company.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "#f0f0f8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {app.company}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#8b8ba8" }}>
              {app.role}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
              {app.location && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "#555570",
                  }}
                >
                  <MapPin size={11} />
                  {app.location}
                </span>
              )}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#555570",
                }}
              >
                <Calendar size={11} />
                Applied {formatDate(app.applied_date)}
              </span>
              <a
                href={app.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#6366f1",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#818cf8")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#6366f1")
                }
              >
                <ExternalLink size={11} />
                View posting
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#555570",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#f0f0f8")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#555570")
            }
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Status picker */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#8b8ba8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 10,
              }}
            >
              Status
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STATUS_ORDER.map((s) => {
                const active = status === s;
                const color = STATUS_COLORS[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#fff" : "#8b8ba8",
                      background: active ? color : "#1e1e2a",
                      border: active
                        ? `1px solid ${color}`
                        : "1px solid #2a2a3d",
                      borderRadius: 8,
                      padding: "7px 14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: active ? `0 0 12px ${color}55` : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.borderColor = color;
                        (e.currentTarget as HTMLElement).style.color = color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.borderColor = "#2a2a3d";
                        (e.currentTarget as HTMLElement).style.color = "#8b8ba8";
                      }
                    }}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#8b8ba8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 8,
              }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recruiter name, interview details, next steps…"
              rows={4}
              style={{
                width: "100%",
                background: "#1e1e2a",
                border: "1px solid #2a2a3d",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#f0f0f8",
                fontSize: 13,
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                lineHeight: 1.6,
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "#4a4a65")
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "#2a2a3d")
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 22px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#f87171",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: deleting ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
            }}
          >
            <Trash2 size={13} />
            {deleting ? "Removing…" : "Remove"}
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                fontSize: 13,
                color: "#8b8ba8",
                background: "#1e1e2a",
                border: "1px solid #2a2a3d",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!isDirty && !saved)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: saved ? "#4ade80" : "white",
                background: saved
                  ? "rgba(34,197,94,0.18)"
                  : isDirty
                  ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                  : "#2a2a3d",
                border: saved ? "1px solid rgba(34,197,94,0.4)" : "none",
                borderRadius: 8,
                padding: "8px 20px",
                cursor: isDirty && !saving ? "pointer" : "default",
                transition: "all 0.15s ease",
                minWidth: 90,
                justifyContent: "center",
              }}
            >
              <Save size={13} />
              {saved ? "Saved!" : saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
