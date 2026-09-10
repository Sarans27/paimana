// src/components/FilterBar.jsx
// Reusable filter bar with DEBOUNCED search and sector/state/risk selects.
//
// FEATURES:
// - Search input with 300ms debounce (doesn't fire on every keystroke)
// - Controlled selects for sector, state, risk
// - All filter values synced to URL query string by the parent page
// - memo() prevents re-renders when props haven't changed
//
// PROPS:
//   searchText, onSearchChange       — the RAW text (displayed in the input)
//   sectorFilter, onSectorChange     — controlled sector dropdown
//   stateFilter, onStateChange       — controlled state dropdown
//   riskFilter, onRiskChange         — controlled risk dropdown
//   sectors                          — array of unique sector strings
//   states                           — array of unique state strings

import { memo } from "react";

const BLUE = "#0B3D91";

const controlsRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "24px",
};

const inputStyle = {
  padding: "10px 14px",
  fontSize: "14px",
  border: "2px solid #e0e0e0",
  borderRadius: "8px",
  outline: "none",
  flex: "1 1 250px",
  minWidth: "200px",
  transition: "border-color 0.2s",
};

const selectStyle = {
  padding: "10px 14px",
  fontSize: "14px",
  border: "2px solid #e0e0e0",
  borderRadius: "8px",
  outline: "none",
  backgroundColor: "white",
  minWidth: "150px",
  cursor: "pointer",
};

// memo() tells React: "Only re-render this component if its PROPS changed."
// Without it, FilterBar re-renders every time the PARENT re-renders,
// even if FilterBar's own props are the same. This prevents wasted work.
const FilterBar = memo(function FilterBar({
  searchText,
  onSearchChange,
  sectorFilter,
  onSectorChange,
  stateFilter,
  onStateChange,
  riskFilter,
  onRiskChange,
  sectors = [],
  states = [],
}) {
  return (
    <div style={controlsRowStyle}>
      {/* Search Input — user types here, parent debounces before filtering */}
      <input
        type="text"
        placeholder="Search by name, sector, or state..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = BLUE)}
        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
      />

      {/* Sector Filter */}
      <select
        value={sectorFilter}
        onChange={(e) => onSectorChange(e.target.value)}
        style={selectStyle}
      >
        <option value="All">All Sectors</option>
        {sectors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* State Filter */}
      <select
        value={stateFilter}
        onChange={(e) => onStateChange(e.target.value)}
        style={selectStyle}
      >
        <option value="All">All States</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Risk Filter */}
      <select
        value={riskFilter}
        onChange={(e) => onRiskChange(e.target.value)}
        style={selectStyle}
      >
        <option value="All">All Risks</option>
        <option value="High">High Risk</option>
        <option value="Medium">Medium Risk</option>
        <option value="Low">Low Risk</option>
      </select>
    </div>
  );
});

export default FilterBar;
