// src/components/FilterBar.jsx
// Project filters: icon search + sector/state/risk/status selects + clear.
// memo() keeps typing cheap — parent callbacks are stable.

import { memo } from "react";

const FilterBar = memo(function FilterBar({
  searchText,
  onSearchChange,
  sectorFilter,
  onSectorChange,
  stateFilter,
  onStateChange,
  riskFilter,
  onRiskChange,
  statusFilter,
  onStatusChange,
  sectors = [],
  states = [],
  statuses = [],
  onClear,
  hasActive = false,
}) {
  return (
    <div className="filterbar" role="search" aria-label="Filter projects">
      <div className="search-wrap">
        <svg
          className="search-wrap__icon"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className="input"
          placeholder="Search by name, sector, or state…"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search projects"
        />
      </div>
      <select
        className="select"
        value={sectorFilter}
        onChange={(e) => onSectorChange(e.target.value)}
        aria-label="Filter by sector"
      >
        <option value="All">All Sectors</option>
        {sectors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        className="select"
        value={stateFilter}
        onChange={(e) => onStateChange(e.target.value)}
        aria-label="Filter by state"
      >
        <option value="All">All States</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        className="select"
        value={riskFilter}
        onChange={(e) => onRiskChange(e.target.value)}
        aria-label="Filter by risk"
      >
        <option value="All">All Risks</option>
        <option value="Critical">Critical Risk</option>
        <option value="High">High Risk</option>
        <option value="Medium">Medium Risk</option>
        <option value="Low">Low Risk</option>
      </select>
      <select
        className="select"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
      >
        <option value="All">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {onClear ? (
        <button
          type="button"
          className="btn btn--secondary btn--sm filterbar__clear"
          onClick={onClear}
          disabled={!hasActive}
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
});

export default FilterBar;
