import { ApplicationStatus, STATUS_LABELS } from "@/lib/types";
import { CSSProperties } from "react";

const STATUS_STYLES: Record<ApplicationStatus, CSSProperties> = {
  applied: {
    background: "rgba(59,130,246,0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(59,130,246,0.3)",
  },
  oa: {
    background: "rgba(249,115,22,0.15)",
    color: "#fb923c",
    border: "1px solid rgba(249,115,22,0.3)",
  },
  phone_screen: {
    background: "rgba(234,179,8,0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(234,179,8,0.3)",
  },
  interview: {
    background: "rgba(168,85,247,0.15)",
    color: "#c084fc",
    border: "1px solid rgba(168,85,247,0.3)",
  },
  offer: {
    background: "rgba(34,197,94,0.15)",
    color: "#4ade80",
    border: "1px solid rgba(34,197,94,0.3)",
  },
  rejected: {
    background: "rgba(239,68,68,0.12)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.25)",
  },
};

interface Props {
  status: ApplicationStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: Props) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 20,
    fontWeight: 500,
    fontSize: size === "sm" ? 11 : 12,
    padding: size === "sm" ? "2px 8px" : "3px 10px",
    whiteSpace: "nowrap",
    ...STATUS_STYLES[status],
  };

  return <span style={base}>{STATUS_LABELS[status]}</span>;
}
