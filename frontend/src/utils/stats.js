// src/utils/stats.js
// Portfolio derivations — the ONLY place that turns a project list
// into counts and aggregates. Dashboard, public views, and the mock
// API layer all consume these; nothing recomputes them inline.

import { normalizeRiskLevel } from "./risk";

/**
 * Derive every portfolio metric from a project array.
 * Unknown statuses/bands are ignored, never invented.
 */
export function calculateProjectStats(projects) {
  const list = Array.isArray(projects) ? projects : [];
  const byBand = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const states = new Set();
  const sectors = new Set();
  let active = 0;
  let delayed = 0;
  let completed = 0;
  let progressSum = 0;
  let above75 = 0;
  let below25 = 0;

  for (const p of list) {
    const band = normalizeRiskLevel(p.risk, p.riskScore);
    if (byBand[band] !== undefined) byBand[band] += 1;
    if (p.status === "Active") active += 1;
    else if (p.status === "Delayed") delayed += 1;
    else if (p.status === "Completed") completed += 1;
    const prog = Number(p.progress) || 0;
    progressSum += prog;
    if (prog >= 75) above75 += 1;
    if (prog < 25) below25 += 1;
    if (p.state) states.add(p.state);
    if (p.sector) sectors.add(p.sector);
  }

  const total = list.length;
  return {
    total,
    active,
    delayed,
    completed,
    highRisk: byBand.High + byBand.Critical,
    byBand,
    avgProgress: total ? Math.round(progressSum / total) : 0,
    above75,
    below25,
    stateCount: states.size,
    sectorCount: sectors.size,
  };
}

/** Newest-first by startDate (ISO strings sort lexicographically). */
export function recentByStartDate(projects, n = 3) {
  return [...(Array.isArray(projects) ? projects : [])]
    .sort((a, b) => String(b.startDate || "").localeCompare(String(a.startDate || "")))
    .slice(0, n);
}

/** Per-sector average progress, derived — never a static table. */
export function sectorProgress(projects) {
  const map = new Map();
  for (const p of Array.isArray(projects) ? projects : []) {
    if (!p.sector) continue;
    const entry = map.get(p.sector) || { sum: 0, n: 0 };
    entry.sum += Number(p.progress) || 0;
    entry.n += 1;
    map.set(p.sector, entry);
  }
  return [...map.entries()]
    .map(([sector, { sum, n }]) => ({ sector, progress: Math.round(sum / n) }))
    .sort((a, b) => a.sector.localeCompare(b.sector));
}
