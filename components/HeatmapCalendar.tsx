"use client";

import { useEffect, useState, useRef } from "react";

interface DayData {
  day: string;   // "YYYY-MM-DD"
  count: number;
}

interface CellInfo {
  date: string;
  count: number;
  x: number;
  y: number;
}

const CELL = 13;
const GAP = 3;
const STEP = CELL + GAP;
const WEEKS = 52;
const DAYS_IN_WEEK = 7;

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(count: number): string {
  if (count === 0) return "#1a1a26";
  if (count === 1) return "#312e81";
  if (count <= 3) return "#4f46e5";
  if (count <= 6) return "#6366f1";
  return "#818cf8";
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function HeatmapCalendar() {
  const [data, setData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/stats/heatmap")
      .then((r) => r.json())
      .then((json: { days: DayData[] }) => {
        const map = new Map<string, number>();
        for (const { day, count } of json.days) {
          map.set(day, count);
        }
        setData(map);
      })
      .finally(() => setLoading(false));
  }, []);

  // Build the grid: last 52 weeks ending today
  // Grid starts on the Sunday that is ≥52 weeks ago
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the Sunday of the current week
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() + (6 - today.getDay())); // end of current week (Saturday)
  // Actually start from last Sunday 52 weeks ago
  const startDate = new Date(endSunday);
  startDate.setDate(endSunday.getDate() - WEEKS * 7 + 1);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Build cells column by column (each column = one week)
  const cells: CellInfo[][] = [];
  const monthLabels: { label: string; col: number }[] = [];
  let seenMonth = -1;

  const cursor = new Date(startDate);
  for (let week = 0; week < WEEKS; week++) {
    const col: CellInfo[] = [];
    for (let dow = 0; dow < DAYS_IN_WEEK; dow++) {
      const key = toDateKey(cursor);
      const count = data.get(key) ?? 0;
      col.push({ date: key, count, x: week * STEP, y: dow * STEP });

      // Track month label for the first day of each month that appears
      if (cursor.getDate() === 1 || (week === 0 && dow === 0)) {
        const m = cursor.getMonth();
        if (m !== seenMonth) {
          seenMonth = m;
          monthLabels.push({ label: MONTH_NAMES[m], col: week });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    cells.push(col);
  }

  const svgWidth = WEEKS * STEP;
  const svgHeight = DAYS_IN_WEEK * STEP;
  const totalApplied = [...data.values()].reduce((s, v) => s + v, 0);

  function handleMouseEnter(cell: CellInfo, e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const d = new Date(cell.date + "T00:00:00");
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    const text = cell.count === 0
      ? `No applications — ${label}`
      : `${cell.count} application${cell.count > 1 ? "s" : ""} — ${label}`;
    setTooltip({
      text,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 36,
    });
  }

  return (
    <div
      style={{
        background: "#16161f",
        border: "1px solid #1f1f2e",
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f0f0f8" }}>
          Application Activity
        </h2>
        <span style={{ fontSize: 13, color: "#555570" }}>
          {totalApplied.toLocaleString()} total {totalApplied === 1 ? "application" : "applications"} in the past year
        </span>
      </div>

      {loading ? (
        <div style={{ height: svgHeight + 24, background: "#1e1e2a", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
      ) : (
        <div ref={containerRef} style={{ position: "relative", overflowX: "auto" }}>
          {/* Tooltip */}
          {tooltip && (
            <div
              style={{
                position: "absolute",
                left: tooltip.x,
                top: tooltip.y,
                transform: "translateX(-50%)",
                background: "#0d0d14",
                border: "1px solid #2a2a3d",
                borderRadius: 6,
                padding: "5px 10px",
                fontSize: 12,
                color: "#f0f0f8",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              {tooltip.text}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {/* Day-of-week labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: GAP, paddingTop: 20, flexShrink: 0 }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  style={{
                    height: CELL,
                    fontSize: 10,
                    color: "#555570",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    justifyContent: "flex-end",
                    paddingRight: 4,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ position: "relative" }}>
              {/* Month labels */}
              <div style={{ position: "relative", height: 18, marginBottom: 4 }}>
                {monthLabels.map(({ label, col }) => (
                  <span
                    key={`${label}-${col}`}
                    style={{
                      position: "absolute",
                      left: col * STEP,
                      fontSize: 10,
                      color: "#555570",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Cells */}
              <div style={{ display: "flex", gap: GAP }}
                onMouseLeave={() => setTooltip(null)}
              >
                {cells.map((col, wi) => (
                  <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                    {col.map((cell) => (
                      <div
                        key={cell.date}
                        onMouseEnter={(e) => handleMouseEnter(cell, e)}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 3,
                          background: getColor(cell.count),
                          cursor: "default",
                          transition: "background 0.1s ease",
                          flexShrink: 0,
                          outline: cell.count > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        }}
                        onMouseOver={(e) => {
                          (e.currentTarget as HTMLElement).style.outline = "1px solid rgba(255,255,255,0.25)";
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLElement).style.outline =
                            cell.count > 0 ? "1px solid rgba(255,255,255,0.05)" : "none";
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, color: "#555570" }}>Less</span>
            {[0, 1, 2, 4, 7].map((n) => (
              <div
                key={n}
                style={{
                  width: CELL,
                  height: CELL,
                  borderRadius: 3,
                  background: getColor(n),
                  outline: n > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              />
            ))}
            <span style={{ fontSize: 11, color: "#555570" }}>More</span>
          </div>
        </div>
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
