// src/utils/risk.js
// Shared risk-band helpers — single source of truth for score → level/color.
// Bands: 0–30 Low/Green, 31–55 Medium/Amber, 56–75 High/Orange, 76–100 Critical/Red.

export const RISK_BANDS = [
  { max: 30, level: "Low", color: "#15803D", bg: "#E7F4EC", border: "#15803D", label: "Low (0–30)" },
  { max: 55, level: "Medium", color: "#B45309", bg: "#FCF1E0", border: "#B45309", label: "Medium (31–55)" },
  { max: 75, level: "High", color: "#C2410C", bg: "#FDEADF", border: "#C2410C", label: "High (56–75)" },
  { max: 100, level: "Critical", color: "#B42318", bg: "#FBE9E7", border: "#B42318", label: "Critical (76–100)" },
];

export function riskBand(score) {
  const s = Number(score);
  if (Number.isNaN(s)) return RISK_BANDS[0];
  for (const band of RISK_BANDS) {
    if (s <= band.max) return band;
  }
  return RISK_BANDS[RISK_BANDS.length - 1];
}

export function riskLevel(score) {
  return riskBand(score).level;
}

export function riskColor(score) {
  return riskBand(score).color;
}

/** Normalize legacy "High/Medium/Low" strings plus numeric scores to a band level. */
export function normalizeRiskLevel(level, score) {
  if (level === "Critical" || level === "High" || level === "Medium" || level === "Low") {
    // A numeric score always wins when present — it is more precise.
    if (score !== undefined && score !== null && score !== "") return riskLevel(score);
    return level;
  }
  if (score !== undefined && score !== null && score !== "") return riskLevel(score);
  return "Low";
}

/* Business-logic aliases — same functions, discoverable names. */
export const getRiskLevel = riskLevel;
export const getRiskColor = riskColor;
export function getRiskCategory(score) {
  return riskBand(score);
}
