"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Search, ChevronDown, X, MapPin } from "lucide-react";

export interface JobFilters {
  jobType: "all" | "internship" | "new-grad";
  company: string;
  locations: string[];
}

interface Props {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
  totalShown?: number;
  totalAll?: number;
}

export default function FilterBar({ filters, onChange, totalShown, totalAll }: Props) {
  const [locationInput, setLocationInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestions whenever the input changes
  useEffect(() => {
    if (fetchRef.current) clearTimeout(fetchRef.current);
    fetchRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locations?q=${encodeURIComponent(locationInput)}`
        );
        const data = await res.json();
        // Remove already-added tags
        const filtered = (data.locations as string[]).filter(
          (loc) =>
            !filters.locations.some(
              (l) => l.toLowerCase() === loc.toLowerCase()
            )
        );
        setSuggestions(filtered);
        setHighlightedIdx(-1);
      } catch {
        setSuggestions([]);
      }
    }, 120);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationInput, focused]);

  function addLocation(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (
      filters.locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())
    )
      return;
    onChange({ ...filters, locations: [...filters.locations, trimmed] });
    setLocationInput("");
    setSuggestions([]);
    setHighlightedIdx(-1);
  }

  function removeLocation(loc: string) {
    onChange({
      ...filters,
      locations: filters.locations.filter((l) => l !== loc),
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (highlightedIdx >= 0 && suggestions[highlightedIdx]) {
        addLocation(suggestions[highlightedIdx]);
      } else {
        addLocation(locationInput);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setHighlightedIdx(-1);
    } else if (
      e.key === "Backspace" &&
      locationInput === "" &&
      filters.locations.length > 0
    ) {
      removeLocation(filters.locations[filters.locations.length - 1]);
    }
  }

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        padding: "12px 16px",
        background: "#13131c",
        border: "1px solid #1f1f2e",
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      {/* Job type */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={filters.jobType}
          onChange={(e) =>
            onChange({
              ...filters,
              jobType: e.target.value as JobFilters["jobType"],
            })
          }
          style={{
            background: "#1e1e2a",
            border: "1px solid #2a2a3d",
            borderRadius: 8,
            padding: "7px 32px 7px 12px",
            color: "#f0f0f8",
            fontSize: 13,
            appearance: "none",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All Types</option>
          <option value="internship">Internship</option>
          <option value="new-grad">New Grad</option>
        </select>
        <ChevronDown
          size={13}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#555570",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Company search */}
      <div style={{ position: "relative", flex: 1, minWidth: 140 }}>
        <Search
          size={13}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#555570",
          }}
        />
        <input
          type="text"
          placeholder="Search company…"
          value={filters.company}
          onChange={(e) => onChange({ ...filters, company: e.target.value })}
          style={{
            width: "100%",
            background: "#1e1e2a",
            border: "1px solid #2a2a3d",
            borderRadius: 8,
            padding: "7px 12px 7px 30px",
            color: "#f0f0f8",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Location multi-tag input with autocomplete */}
      <div style={{ position: "relative", flex: 2, minWidth: 200 }}>
        <div
          ref={dropdownRef}
          onClick={() => inputRef.current?.focus()}
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            background: "#1e1e2a",
            border: `1px solid ${focused ? "#4a4a65" : "#2a2a3d"}`,
            borderRadius: showDropdown ? "8px 8px 0 0" : 8,
            padding: "5px 10px",
            cursor: "text",
            transition: "border-color 0.15s ease",
          }}
        >
          <MapPin size={13} color="#555570" style={{ flexShrink: 0 }} />

          {/* Tags */}
          {filters.locations.map((loc) => (
            <span
              key={loc}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 500,
                color: "#a5b4fc",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 6,
                padding: "2px 6px 2px 8px",
                whiteSpace: "nowrap",
              }}
            >
              {loc}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLocation(loc);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  color: "#6366f1",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#f87171")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#6366f1")
                }
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              // Delay so a click on a suggestion registers first
              setTimeout(() => {
                setFocused(false);
                setSuggestions([]);
              }, 150);
            }}
            placeholder={
              filters.locations.length === 0 ? "Add location…" : ""
            }
            style={{
              flex: 1,
              minWidth: 100,
              background: "none",
              border: "none",
              outline: "none",
              color: "#f0f0f8",
              fontSize: 13,
              padding: "2px 0",
            }}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#1e1e2a",
              border: "1px solid #4a4a65",
              borderTop: "1px solid #2a2a3d",
              borderRadius: "0 0 8px 8px",
              zIndex: 100,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {suggestions.map((loc, idx) => (
              <div
                key={loc}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addLocation(loc);
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  color: idx === highlightedIdx ? "#f0f0f8" : "#c4c4d8",
                  background:
                    idx === highlightedIdx ? "#2d2d42" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={() => setHighlightedIdx(idx)}
                onMouseLeave={() => setHighlightedIdx(-1)}
              >
                <MapPin size={12} color="#555570" />
                {/* Bold the matching portion */}
                {locationInput
                  ? highlightMatch(loc, locationInput)
                  : loc}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {totalAll !== undefined && (
        <span
          style={{
            fontSize: 12,
            color: "#555570",
            marginLeft: "auto",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {totalShown ?? 0} of {totalAll} jobs
        </span>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span style={{ color: "#a5b4fc", fontWeight: 600 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </span>
  );
}
