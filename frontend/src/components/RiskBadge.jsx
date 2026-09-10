// src/components/RiskBadge.jsx
// Risk tag supporting Low / Medium / High / Critical.
// Accepts either a level string or a numeric score (score wins).

import { normalizeRiskLevel } from "../utils/risk";

function RiskBadge({ level, score }) {
  const normalized = normalizeRiskLevel(level, score);
  const cls = `badge badge--${normalized.toLowerCase()}`;
  return (
    <span className={cls}>
      <span className="badge__dot" aria-hidden="true" />
      {normalized} Risk
    </span>
  );
}

export default RiskBadge;
