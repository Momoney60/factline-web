import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════
// SUPABASE — Replace with your credentials
// ═══════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://mnkrsdhadxwinwcipwip.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3JzZGhhZHh3aW53Y2lwd2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTE3MzYsImV4cCI6MjA4ODEyNzczNn0.caya9o3h4bJooHRZAKo9FpaI2VbnZglYblSEadGuCX0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ═══════════════════════════════════════════════════════════════
// CHANNELS
// Note: "top" is a tab, not a channel in DB. We keep it in the list
// because you included it, but we will NOT show it in the dropdown.
// ═══════════════════════════════════════════════════════════════
const CHANNELS = [
  { id: "top", label: "Top", color: "#60a5fa" },

  { id: "world", label: "World", color: "#3b82f6" },
  { id: "us", label: "U.S.", color: "#6366f1" },
  { id: "politics", label: "Politics", color: "#a855f7" },

  { id: "business", label: "Business", color: "#8b5cf6" },
  { id: "markets", label: "Markets", color: "#eab308" },
  { id: "economy", label: "Economy", color: "#f59e0b" },

  { id: "tech", label: "Tech", color: "#06b6d4" },
  { id: "ai", label: "AI", color: "#22d3ee" },
  { id: "cyber", label: "Cyber", color: "#0ea5e9" },

  { id: "science", label: "Science", color: "#14b8a6" },
  { id: "health", label: "Health", color: "#22c55e" },
  { id: "energy", label: "Energy", color: "#84cc16" },

  { id: "real-estate", label: "Real Estate", color: "#fb7185" },
  { id: "law", label: "Law", color: "#94a3b8" },

  { id: "sports", label: "Sports", color: "#f97316" },
  { id: "nhl", label: "NHL", color: "#0ea5e9" },

  { id: "climate", label: "Climate", color: "#10b981" },
  { id: "bright", label: "Bright Side", color: "#fbbf24" },
  { id: "live-event", label: "Live", color: "#ef4444" },
];

// Channels that actually exist as Facts.ch values (exclude "top")
const FEED_CHANNELS = CHANNELS.filter((c) => c.id !== "top");

// ═══════════════════════════════════════════════════════════════
// MISSION COPY
// ═══════════════════════════════════════════════════════════════
const MISSION = {
  title: "Mission",
  bullets: [
    "A feed built for information, not engagement.",
    "No likes. No comments. No creators chasing clicks.",
    "Each item includes sources and a confidence score.",
    '"Confirmed" means multiple independent sources matched the same story.',
    '"Developing" means a single source or incomplete corroboration.',
    "No opinion. Structured summaries of reported facts.",
    "Corrections happen on the next engine cycle.",
  ],
  footnote:
    "ReadOnly is an information layer. Always verify directly with the linked sources.",
};

// ═══════════════════════════════════════════════════════════════
// HEAT COLOR HELPER
// ═══════════════════════════════════════════════════════════════
function heatColor(v) {
  if (v >= 90) return "#ef4444";
  if (v >= 80) return "#f97316";
  if (v >= 65) return "#f59e0b";
  return "#3b82f6";
}

// ═══════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════
const CSS = `
  :root {
    --bg-0: #06060a; --bg-1: #0d0d14; --bg-2: #131320; --bg-3: #1a1a2a;
    --border: #1c1c2e; --border-light: #28283e;
    --text-0: #f0f0f5; --text-1: #c8c8d8; --text-2: #8888a0; --text-3: #55556e;
    --green: #22c55e; --amber: #f59e0b; --red: #ef4444; --blue: #3b82f6;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    background: var(--bg-0); color: var(--text-0);
    font-family: var(--sans); -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }
  #root { display: flex; flex-direction: column; }
  ::-webkit-scrollbar { width: 0; height: 0; }

  .shell { display: flex; flex-direction: column; height: 100%; }

  /* TOP HEADER */
  .top-header {
    padding: 14px 20px 0; display: flex; align-items: center;
    justify-content: space-between; flex-shrink: 0;
  }
  .brand { font-family: var(--mono); font-size: 13px; font-weight: 700; letter-spacing: 3px; color: var(--text-0); }
  .brand span { color: var(--blue); }
  .sync-badge { font-family: var(--mono); font-size: 9px; color: var(--text-3); display: flex; align-items: center; gap: 5px; }
  .sync-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }

  /* CHANNEL DROPDOWN */
  .ch-dropdown-wrap { padding: 12px 20px 14px; flex-shrink: 0; position: relative; }
  .ch-dropdown-btn {
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    padding: 12px 16px; background: var(--bg-1); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text-0); font-family: var(--sans);
    font-size: 15px; font-weight: 600; cursor: pointer;
    -webkit-tap-highlight-color: transparent; transition: border-color 0.2s;
  }
  .ch-dropdown-btn:active { border-color: var(--border-light); }
  .ch-label-row { display: flex; align-items: center; gap: 10px; }
  .ch-color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .ch-fact-count { font-family: var(--mono); font-size: 10px; color: var(--text-3); font-weight: 400; }
  .ch-arrow { font-size: 12px; color: var(--text-3); transition: transform 0.2s; }
  .ch-arrow.open { transform: rotate(180deg); }

  .ch-dropdown-menu {
  position: absolute;
  top: calc(100% - 4px);
  left: 20px;
  right: 20px;

  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: 10px;
  z-index: 50;

  /* key fix */
  max-height: min(62vh, 520px);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;

  animation: fadeDown 0.15s ease;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}

/* optional but nice: show a thin scrollbar on desktop */
.ch-dropdown-menu::-webkit-scrollbar { width: 6px; }
.ch-dropdown-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 8px; }
.ch-dropdown-menu::-webkit-scrollbar-track { background: transparent; }
  .ch-dropdown-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-bottom: 1px solid var(--border); cursor: pointer;
    -webkit-tap-highlight-color: transparent; transition: background 0.1s;
  }
  .ch-dropdown-item:last-child { border-bottom: none; }
  .ch-dropdown-item:active, .ch-dropdown-item.active { background: var(--bg-2); }
  .ch-dropdown-item .ch-label-row { font-size: 15px; font-weight: 500; color: var(--text-0); }

  /* SCROLL BODY */
  .scroll-body {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(72px + var(--safe-bottom));
  }

  .section-label {
    font-family: var(--mono); font-size: 10px; font-weight: 600;
    letter-spacing: 1.5px; color: var(--text-3);
    text-transform: uppercase; padding: 16px 20px 10px;
  }

  /* FACT CARD */
  .fact-card {
    padding: 18px 20px; border-bottom: 1px solid var(--border);
    -webkit-tap-highlight-color: transparent; cursor: pointer; transition: background 0.15s;
  }
  .fact-card:active { background: var(--bg-1); }

  .fact-tags { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }

  .tag {
    font-family: var(--mono); font-size: 9px; font-weight: 600;
    letter-spacing: 0.8px; padding: 3px 8px; border-radius: 3px; text-transform: uppercase;
  }
  .tag-confirmed { background: rgba(34,197,94,0.1); color: var(--green); }
  .tag-developing { background: rgba(245,158,11,0.1); color: var(--amber); }
  .tag-ch { background: rgba(59,130,246,0.08); color: var(--blue); }

  .fact-title { font-size: 17px; font-weight: 600; line-height: 1.38; color: var(--text-0); margin-bottom: 6px; }
  .fact-snippet {
    font-size: 14px; line-height: 1.55; color: var(--text-2);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .fact-meta { font-family: var(--mono); font-size: 9px; color: var(--text-3); margin-top: 8px; letter-spacing: 0.3px; }

  /* EXPANDED DETAIL */
  .fact-detail {
    margin-top: 14px; padding: 14px 16px; background: var(--bg-2);
    border: 1px solid var(--border); border-radius: 8px; animation: fadeUp 0.2s ease;
  }
  .detail-label {
    font-family: var(--mono); font-size: 9px; font-weight: 600;
    letter-spacing: 1.5px; color: var(--text-3);
    text-transform: uppercase; margin-bottom: 6px; margin-top: 14px;
  }
  .detail-label:first-child { margin-top: 0; }
  .fact-list { list-style: none; }
  .fact-list li {
    font-size: 14px; line-height: 1.55; color: var(--text-1);
    padding: 4px 0 4px 16px; position: relative;
  }
  .fact-list li::before { content: '▸'; position: absolute; left: 0; color: var(--text-3); font-size: 11px; }
  .detail-ctx { font-size: 14px; line-height: 1.6; color: var(--text-2); }
  .detail-intel { font-family: var(--mono); font-size: 9px; color: var(--text-3); line-height: 2; }

  /* TOP STORIES */
  .ts-card {
    margin: 0 20px 12px; padding: 16px 18px; background: var(--bg-1);
    border: 1px solid var(--border); border-radius: 10px; cursor: pointer;
    -webkit-tap-highlight-color: transparent; position: relative; overflow: hidden;
  }
  .ts-card:active { border-color: var(--border-light); }
  .ts-rank {
    font-family: var(--mono); font-size: 56px; font-weight: 800;
    color: rgba(255,255,255,0.025); position: absolute; top: -6px; right: 10px;
    line-height: 1; pointer-events: none;
  }
  .ts-card .fact-title { font-size: 16px; }

  /* BRIEFING (TOP TAB UPGRADE) */
  .brief-head { padding: 18px 20px 10px; }
  .brief-title { font-size: 20px; font-weight: 700; color: var(--text-0); margin-bottom: 6px; }
  .brief-sub { font-family: var(--mono); font-size: 10px; color: var(--text-3); letter-spacing: 0.4px; line-height: 1.8; }
  .brief-card {
    margin: 0 20px 12px; padding: 16px 18px;
    background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
    border: 1px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    position: relative; overflow: hidden;
  }
  .brief-card:active { border-color: var(--border-light); }
  .brief-rank {
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    color: var(--text-3);
    letter-spacing: 0.6px;
  }
  .brief-toprow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
  .brief-pill-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .brief-facts {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .brief-facts .detail-label { margin-top: 0; }
  .brief-mini {
    list-style: none;
  }
  .brief-mini li {
    font-size: 14px; line-height: 1.55; color: var(--text-1);
    padding: 4px 0 4px 16px; position: relative;
  }
  .brief-mini li::before { content: '▸'; position: absolute; left: 0; color: var(--text-3); font-size: 11px; }

  /* BRIGHT SIDE */
  .bright-header { padding: 24px 20px 6px; }
  .bright-title {
    font-size: 22px; font-weight: 700;
    background: linear-gradient(135deg, #f59e0b, #fbbf24, #f97316);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 4px;
  }
  .bright-sub { font-size: 13px; color: var(--text-2); line-height: 1.5; }
  .bright-card {
    margin: 12px 20px; padding: 18px;
    background: linear-gradient(135deg, rgba(245,158,11,0.06), rgba(249,115,22,0.03));
    border: 1px solid rgba(245,158,11,0.12); border-radius: 12px; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .bright-card:active { border-color: rgba(245,158,11,0.25); }
  .bright-card .fact-title {
    font-size: 17px; background: linear-gradient(135deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .bright-card .fact-snippet { color: var(--text-1); }
  .bright-card .tag-confirmed { background: rgba(251,191,36,0.1); color: #fbbf24; }
  .bright-card .fact-meta { color: var(--text-2); }
  .bright-card .fact-detail { background: rgba(245,158,11,0.05); border-color: rgba(245,158,11,0.12); }
  .bright-card .fact-list li { color: var(--text-0); }
  .bright-card .detail-ctx { color: var(--text-1); }

  /* LIVE */
  .live-banner {
    margin: 8px 20px 12px; padding: 14px 16px;
    background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px; cursor: pointer; position: relative; overflow: hidden;
  }
  .live-banner::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--red), transparent);
    animation: scanLine 2.5s linear infinite;
  }
  .live-indicator {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--mono); font-size: 9px; font-weight: 600;
    letter-spacing: 1.5px; color: var(--red); text-transform: uppercase; margin-bottom: 8px;
  }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); animation: pulse 1.5s infinite; }
  .live-banner .fact-title { font-size: 16px; }
  .live-card { padding: 18px 20px; border-bottom: 1px solid rgba(239,68,68,0.1); cursor: pointer; }
  .live-card:active { background: var(--bg-1); }

  /* BOTTOM NAV */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(6, 6, 10, 0.94); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border); display: flex; justify-content: space-around;
    padding: 8px 0 calc(8px + var(--safe-bottom)); z-index: 100;
  }
  .nav-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    background: none; border: none; padding: 6px 12px; cursor: pointer;
    -webkit-tap-highlight-color: transparent; position: relative; min-width: 56px;
  }
  .nav-icon { font-size: 20px; transition: transform 0.15s; }
  .nav-btn:active .nav-icon { transform: scale(0.9); }
  .nav-label { font-family: var(--sans); font-size: 10px; font-weight: 500; color: var(--text-3); }
  .nav-btn.active .nav-label { color: var(--text-0); }
  .nav-alert-dot {
    position: absolute; top: 2px; right: 8px; width: 6px; height: 6px;
    border-radius: 50%; background: var(--red); animation: pulse 1.5s infinite;
  }

  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; text-align: center; }
  .empty-icon { font-size: 28px; opacity: 0.25; margin-bottom: 14px; }
  .empty-text { font-family: var(--mono); font-size: 11px; color: var(--text-3); letter-spacing: 0.3px; line-height: 1.8; }
  .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 60px 20px; }
  .spinner { width: 22px; height: 22px; border: 2px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 14px; }

  .overlay { position: fixed; inset: 0; z-index: 40; background: rgba(0,0,0,0.4); }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scanLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  .anim-in { animation: fadeUp 0.2s ease forwards; }

  @media (min-width: 768px) {
    .scroll-body { max-width: 640px; margin: 0 auto; width: 100%; }
    .bottom-nav { max-width: 640px; left: 50%; transform: translateX(-50%); border-radius: 16px 16px 0 0; }
    .top-header { max-width: 640px; margin: 0 auto; width: 100%; }
    .ch-dropdown-wrap { max-width: 640px; margin: 0 auto; width: 100%; }
  }
`;

// ═══════════════════════════════════════════════════════════════
// HEAT BAR — fully inline, no CSS classes, guaranteed visible
// ═══════════════════════════════════════════════════════════════
function HeatBar({ value, size = "sm" }) {
  const pct = Math.max(15, Math.min(100, ((value - 40) / 60) * 100));
  const col = heatColor(value);
  const trackW = size === "lg" ? "100%" : 56;
  const trackH = size === "lg" ? 8 : 5;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size === "lg" ? 10 : 6,
        marginLeft: size === "sm" ? "auto" : 0,
        flex: size === "lg" ? 1 : "none",
      }}
    >
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: size === "lg" ? 16 : 10,
          fontWeight: 700,
          color: col,
          minWidth: size === "lg" ? 30 : 20,
        }}
      >
        {value}
      </span>
      <div
        style={{
          width: trackW,
          height: trackH,
          background: "#1a1a2a",
          borderRadius: trackH,
          overflow: "hidden",
          position: "relative",
          flexShrink: size === "lg" ? 1 : 0,
          flex: size === "lg" ? 1 : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: pct + "%",
            borderRadius: trackH,
            background: `linear-gradient(90deg, ${col}88, ${col})`,
            boxShadow: `0 0 ${size === "lg" ? 8 : 4}px ${col}66`,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════
function StatusTag({ status }) {
  return (
    <span
      className={`tag ${
        status === "Confirmed" ? "tag-confirmed" : "tag-developing"
      }`}
    >
      {status}
    </span>
  );
}

function ConfText({ value }) {
  const c =
    value >= 90 ? "var(--green)" : value >= 75 ? "var(--amber)" : "var(--red)";
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: 9,
        fontWeight: 600,
        color: c,
      }}
    >
      {value}%
    </span>
  );
}

function FactDetail({ fact }) {
  return (
    <div className="fact-detail anim-in">
      <div className="detail-label">Verified Facts</div>
      {Array.isArray(fact.facts) && (
        <ul className="fact-list">
          {fact.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      <div className="detail-label">Context</div>
      <div className="detail-ctx">{fact.ctx || "No additional context."}</div>
      <div className="detail-label">Heat Score</div>
      <HeatBar value={fact.ht} size="lg" />
      <div className="detail-label">Intelligence</div>
      <div className="detail-intel">
        {fact.co}% CONFIDENCE · {fact.st?.toUpperCase()} · {fact.agent}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOP TAB HELPERS (client-side dedupe + nicer cards)
// ═══════════════════════════════════════════════════════════════
function normalizeTitle(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// quick and safe: group very similar headlines
function topicKeyFromTitle(title) {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "as",
    "at",
    "by",
    "from",
    "into",
    "amid",
    "after",
    "before",
    "over",
    "up",
    "down",
    "new",
    "live",
    "update",
    "updates",
    "breaking",
    "says",
    "say",
    "report",
    "reports",
    "reported",
    "drives",
    "driving",
    "spike",
    "spikes",
    "surge",
    "surges",
  ]);
  const toks = normalizeTitle(title)
    .split(" ")
    .filter((t) => t && t.length > 2 && !stop.has(t));
  return toks.slice(0, 8).join("-");
}

function miniFacts(fact) {
  if (!Array.isArray(fact?.facts)) return [];
  return fact.facts.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [facts, setFacts] = useState([]);
  const [explore, setExplore] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("feed");
  const [activeCh, setActiveCh] = useState("world");

  const [expandedId, setExpandedId] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [fRes, eRes] = await Promise.all([
        supabase
          .from("Facts")
          .select("*")
          .order("id", { ascending: false })
          .limit(400),
        supabase
          .from("Explore")
          .select("*")
          .order("rank", { ascending: true })
          .limit(12), // allow more, we will dedupe locally to get a clean Top 6
      ]);

      if (fRes.data) setFacts(fRes.data);
      if (eRes.data) setExplore(eRes.data);

      setLastSync(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const ch = supabase
      .channel("fl-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Facts" },
        (p) => {
          setFacts((prev) => [p.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Explore" },
        () => {
          supabase
            .from("Explore")
            .select("*")
            .order("rank", { ascending: true })
            .limit(12)
            .then(({ data }) => {
              if (data) setExplore(data);
            });
        }
      )
      .subscribe();

    const poll = setInterval(fetchAll, 60000);

    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, [fetchAll]);

  const liveFacts = facts.filter((f) => f.ch === "live-event");
  const brightFacts = facts.filter((f) => f.ch === "bright").slice(0, 12);
  const channelFacts = facts.filter((f) => f.ch === activeCh).slice(0, 20);
  const hasLive = liveFacts.length > 0;

  const chCounts = {};
  FEED_CHANNELS.forEach((c) => {
    chCounts[c.id] = facts.filter((f) => f.ch === c.id).length;
  });

  const activeMeta =
    FEED_CHANNELS.find((c) => c.id === activeCh) || FEED_CHANNELS[0];

  const toggle = (id) => setExpandedId(expandedId === id ? null : id);

  const switchTab = (t) => {
    setTab(t);
    setExpandedId(null);
    setDropdownOpen(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const selectChannel = (chId) => {
    setActiveCh(chId);
    setDropdownOpen(false);
    setExpandedId(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  // Build Top Briefing list (clean, minimal duplicates, still uses Explore ordering)
  const topBriefing = (() => {
    const seen = new Set();
    const out = [];

    for (const item of explore || []) {
      const full = facts.find((f) => f.id === item.fact_id) || item;
      const k = topicKeyFromTitle(full?.title);

      if (!k) continue;
      if (seen.has(k)) continue;

      seen.add(k);
      out.push({ item, full });

      if (out.length >= 6) break;
    }
    return out;
  })();

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* TOP HEADER */}
        <div className="top-header">
          <div className="brand">
            READ<span>ONLY</span>
          </div>
          <div className="sync-badge">
            <span className="sync-dot" />
            {lastSync
              ? lastSync.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "..."}
          </div>
        </div>

        {/* CHANNEL DROPDOWN */}
        {tab === "feed" && (
          <div className="ch-dropdown-wrap">
            <button
              className="ch-dropdown-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="ch-label-row">
                <span
                  className="ch-color-dot"
                  style={{ background: activeMeta?.color }}
                />
                <span>{activeMeta?.label}</span>
                <span className="ch-fact-count">
                  {chCounts[activeCh] || 0} facts
                </span>
              </div>
              <span className={`ch-arrow ${dropdownOpen ? "open" : ""}`}>▾</span>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="overlay"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="ch-dropdown-menu">
                  {FEED_CHANNELS.map((ch) => (
                    <div
                      key={ch.id}
                      className={`ch-dropdown-item ${
                        activeCh === ch.id ? "active" : ""
                      }`}
                      onClick={() => selectChannel(ch.id)}
                    >
                      <div className="ch-label-row">
                        <span
                          className="ch-color-dot"
                          style={{
                            background: ch.color,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                        <span>{ch.label}</span>
                      </div>
                      <span className="ch-fact-count">
                        {chCounts[ch.id] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* SCROLL BODY */}
        <div className="scroll-body" ref={scrollRef}>
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <div className="empty-text">CONNECTING TO INTELLIGENCE FEED...</div>
            </div>
          ) : (
            <>
              {/* ═══ FEED ═══ */}
              {tab === "feed" && (
                <>
                  {hasLive &&
                    liveFacts.slice(0, 2).map((lf) => (
                      <div
                        key={lf.id}
                        className="live-banner"
                        onClick={() => switchTab("live")}
                      >
                        <div className="live-indicator">
                          <span className="live-dot" />
                          LIVE{" "}
                          {lf.live_tag
                            ? `· ${lf.live_tag.toUpperCase().replace(/-/g, " ")}`
                            : ""}
                        </div>
                        <div className="fact-title" style={{ fontSize: 15 }}>
                          {lf.title}
                        </div>
                        <div className="fact-meta" style={{ marginTop: 6 }}>
                          {Array.isArray(lf.src) ? lf.src.join(" · ") : lf.src}
                        </div>
                      </div>
                    ))}

                  {channelFacts.length > 0 ? (
                    channelFacts.map((fact) => (
                      <div
                        key={fact.id}
                        className="fact-card"
                        onClick={() => toggle(fact.id)}
                      >
                        <div className="fact-tags">
                          <StatusTag status={fact.st} />
                          <ConfText value={fact.co} />
                          <HeatBar value={fact.ht} />
                        </div>
                        <div className="fact-title">{fact.title}</div>
                        {expandedId !== fact.id && fact.ctx && (
                          <div className="fact-snippet">{fact.ctx}</div>
                        )}
                        <div className="fact-meta">
                          {Array.isArray(fact.src)
                            ? fact.src.join(" · ")
                            : fact.src}{" "}
                          · {fact.agent}
                        </div>
                        {expandedId === fact.id && <FactDetail fact={fact} />}
                      </div>
                    ))
                  ) : (
                    <div className="empty">
                      <div className="empty-icon">◉</div>
                      <div className="empty-text">
                        No intelligence yet for {activeMeta?.label}.<br />
                        Waiting for next engine cycle...
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ═══ TOP STORIES (BRIEFING) ═══ */}
              {tab === "top" && (
                <>
                  <div className="brief-head">
                    <div className="brief-title">Top Briefing</div>
                    <div className="brief-sub">
                      Ranked by velocity · deduped for clarity
                      {lastSync
                        ? ` · last sync ${lastSync.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </div>
                  </div>

                  {topBriefing.length > 0 ? (
                    topBriefing.map(({ item, full }, idx) => {
                      const factsMini = miniFacts(full);
                      const chMeta = FEED_CHANNELS.find((c) => c.id === item.ch);

                      return (
                        <div
                          key={item.id}
                          className="brief-card anim-in"
                          onClick={() => toggle(item.id)}
                        >
                          <div className="brief-toprow">
                            <div className="brief-pill-row">
                              <span className="brief-rank">#{idx + 1}</span>

                              <span
                                className="tag tag-ch"
                                style={
                                  item.ch === "live-event"
                                    ? {
                                        background: "rgba(239,68,68,0.08)",
                                        color: "var(--red)",
                                      }
                                    : chMeta?.color
                                    ? {
                                        background: `${chMeta.color}14`,
                                        color: chMeta.color,
                                      }
                                    : {}
                                }
                              >
                                {item.ch === "live-event"
                                  ? item.live_tag || "live"
                                  : item.ch}
                              </span>

                              <StatusTag status={item.st} />
                              <ConfText value={item.co} />
                            </div>

                            <HeatBar value={item.ht} />
                          </div>

                          <div className="fact-title" style={{ fontSize: 18 }}>
                            {item.title}
                          </div>

                          {/* mini facts = "reward" without tapping */}
                          {factsMini.length > 0 && expandedId !== item.id && (
                            <div className="brief-facts">
                              <div className="detail-label">Key facts</div>
                              <ul className="brief-mini">
                                {factsMini.map((f, i) => (
                                  <li key={i}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="fact-meta" style={{ marginTop: 10 }}>
                            {Array.isArray(item.src)
                              ? item.src.join(" · ")
                              : item.src}
                          </div>

                          {expandedId === item.id && full && (
                            <FactDetail fact={full} />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty">
                      <div className="empty-icon">◎</div>
                      <div className="empty-text">
                        Top stories not yet available.
                        <br />
                        Waiting for engine cycle...
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ═══ BRIGHT SIDE ═══ */}
              {tab === "bright" && (
                <>
                  <div className="bright-header">
                    <div className="bright-title">The Bright Side</div>
                    <div className="bright-sub">
                      Breakthroughs, discoveries, and stories worth sharing at the
                      dinner table.
                    </div>
                  </div>
                  {brightFacts.length > 0 ? (
                    brightFacts.map((fact) => (
                      <div
                        key={fact.id}
                        className="bright-card anim-in"
                        onClick={() => toggle(fact.id)}
                      >
                        <div className="fact-tags">
                          <StatusTag status={fact.st} />
                          <ConfText value={fact.co} />
                        </div>
                        <div className="fact-title">{fact.title}</div>
                        {expandedId !== fact.id && fact.ctx && (
                          <div className="fact-snippet">{fact.ctx}</div>
                        )}
                        <div className="fact-meta">
                          {Array.isArray(fact.src) ? fact.src.join(" · ") : fact.src}
                        </div>
                        {expandedId === fact.id && <FactDetail fact={fact} />}
                      </div>
                    ))
                  ) : (
                    <div className="empty">
                      <div className="empty-icon">☀</div>
                      <div className="empty-text">
                        Good news is on the way.
                        <br />
                        The Bright Side updates every cycle.
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ═══ LIVE ═══ */}
              {tab === "live" && (
                <>
                  <div
                    className="section-label"
                    style={{ paddingTop: 20, color: "var(--red)" }}
                  >
                    ● Live Events
                  </div>

                  {liveFacts.length > 0 ? (
                    liveFacts.map((fact) => (
                      <div
                        key={fact.id}
                        className="live-card"
                        onClick={() => toggle(fact.id)}
                      >
                        <div className="live-indicator" style={{ marginBottom: 10 }}>
                          <span className="live-dot" />
                          LIVE{" "}
                          {fact.live_tag
                            ? `· ${fact.live_tag.toUpperCase().replace(/-/g, " ")}`
                            : ""}
                        </div>

                        <div className="fact-tags">
                          <StatusTag status={fact.st} />
                          <ConfText value={fact.co} />
                          <HeatBar value={fact.ht} />
                        </div>

                        <div className="fact-title" style={{ fontSize: 19 }}>
                          {fact.title}
                        </div>

                        {expandedId !== fact.id && fact.ctx && (
                          <div className="fact-snippet" style={{ WebkitLineClamp: 3 }}>
                            {fact.ctx}
                          </div>
                        )}

                        <div className="fact-meta">
                          {Array.isArray(fact.src) ? fact.src.join(" · ") : fact.src} ·{" "}
                          {fact.agent}
                        </div>

                        {expandedId === fact.id && <FactDetail fact={fact} />}
                      </div>
                    ))
                  ) : (
                    <div className="empty">
                      <div className="empty-icon">⚡</div>
                      <div className="empty-text">
                        No live events right now.
                        <br />
                        Major stories will appear here automatically.
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ═══ MISSION ═══ */}
              {tab === "mission" && (
                <>
                  <div className="section-label" style={{ paddingTop: 20 }}>
                    {MISSION.title}
                  </div>

                  <div className="ts-card anim-in" style={{ marginTop: 8 }}>
                    <div className="fact-title" style={{ marginBottom: 10 }}>
                      Why this exists
                    </div>

                    <ul className="fact-list">
                      {MISSION.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>

                    <div className="fact-meta" style={{ marginTop: 12 }}>
                      {MISSION.footnote}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div className="bottom-nav">
          <button
            className={`nav-btn ${tab === "feed" ? "active" : ""}`}
            onClick={() => switchTab("feed")}
          >
            <span
              className="nav-icon"
              style={
                tab === "feed"
                  ? { filter: "drop-shadow(0 0 4px rgba(59,130,246,0.5))" }
                  : {}
              }
            >
              {tab === "feed" ? "◉" : "○"}
            </span>
            <span className="nav-label">Feed</span>
          </button>

          <button
            className={`nav-btn ${tab === "top" ? "active" : ""}`}
            onClick={() => switchTab("top")}
          >
            <span
              className="nav-icon"
              style={
                tab === "top"
                  ? { filter: "drop-shadow(0 0 4px rgba(59,130,246,0.5))" }
                  : {}
              }
            >
              {tab === "top" ? "◈" : "◇"}
            </span>
            <span className="nav-label">Top</span>
          </button>

          <button
            className={`nav-btn ${tab === "bright" ? "active" : ""}`}
            onClick={() => switchTab("bright")}
          >
            <span
              className="nav-icon"
              style={
                tab === "bright"
                  ? {
                      color: "#fbbf24",
                      filter: "drop-shadow(0 0 6px rgba(251,191,36,0.4))",
                    }
                  : {}
              }
            >
              {tab === "bright" ? "✦" : "✧"}
            </span>
            <span
              className="nav-label"
              style={tab === "bright" ? { color: "#fbbf24" } : {}}
            >
              Bright
            </span>
          </button>

          <button
            className={`nav-btn ${tab === "mission" ? "active" : ""}`}
            onClick={() => switchTab("mission")}
          >
            <span
              className="nav-icon"
              style={
                tab === "mission"
                  ? { filter: "drop-shadow(0 0 4px rgba(59,130,246,0.5))" }
                  : {}
              }
            >
              {tab === "mission" ? "⬡" : "⬢"}
            </span>
            <span className="nav-label">Mission</span>
          </button>

          {hasLive && (
            <button
              className={`nav-btn ${tab === "live" ? "active" : ""}`}
              onClick={() => switchTab("live")}
            >
              {tab !== "live" && <span className="nav-alert-dot" />}
              <span
                className="nav-icon"
                style={{ color: tab === "live" ? "var(--red)" : "" }}
              >
                ⚡
              </span>
              <span
                className="nav-label"
                style={tab === "live" ? { color: "var(--red)" } : {}}
              >
                Live
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}