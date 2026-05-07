import { LucideIcon } from "lucide-react";
import { CSSProperties } from "react";

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  sub?: string;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  sub,
}: Props) {
  const card: CSSProperties = {
    background: "#16161f",
    border: `1px solid ${borderColor}`,
    borderRadius: 14,
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    minWidth: 0,
  };

  return (
    <div style={card}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#f0f0f8",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, color: "#8b8ba8", marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#555570", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
