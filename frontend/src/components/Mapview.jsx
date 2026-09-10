// src/components/Mapview.jsx
// Interactive India map with project markers colored by risk score.
// Keyless Leaflet + OpenStreetMap standard tiles (no API key required).
//
// PROPS:
//   projects       — array of project objects (must have lat, lng, riskScore)
//   onProjectClick — function called with (project) when "View Details" is clicked
//   title          — panel heading (default "Project Map")
//   subtitle       — panel subheading (default "Infrastructure projects across India")

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { riskBand, RISK_BANDS } from "../utils/risk";
import { formatBudgetCr } from "../utils/format";
import { statusToneClass } from "../utils/status";
import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";

/* ----------------------------------------------------------------
   1.  India view + tile source (no key required)
   ---------------------------------------------------------------- */
const INDIA_BOUNDS = [
  [6.0, 67.5], // Southwest
  [37.6, 97.8], // Northeast
];
const INDIA_CENTER = [22.7, 82.2];

const INDIA_GEOJSON_URL =
  "https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson";

/* Module-level cache: the boundary file is fetched once per session,
   not once per map mount (Public + Map pages remount on every visit). */
let indiaGeojsonCache = null;
let indiaGeojsonInflight = null;

function getIndiaGeojson() {
  if (indiaGeojsonCache) return Promise.resolve(indiaGeojsonCache);
  if (!indiaGeojsonInflight) {
    indiaGeojsonInflight = fetch(INDIA_GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`GeoJSON ${r.status}`);
        return r.json();
      })
      .then((data) => {
        indiaGeojsonCache = data;
        return data;
      })
      .catch((err) => {
        indiaGeojsonInflight = null;
        throw err;
      });
  }
  return indiaGeojsonInflight;
}

/* ----------------------------------------------------------------
   2.  GeoJSON state boundaries — fails silently, never breaks map
   ---------------------------------------------------------------- */
function StateBoundaries() {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getIndiaGeojson()
      .then((data) => {
        if (!cancelled) setGeojson(data);
      })
      .catch(() => {
        // Offline / blocked gist: map still works without state overlay.
        if (!cancelled) setGeojson(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const style = useMemo(
    () => () => ({
      color: "#64748b",
      weight: 1,
      opacity: 0.9,
      fillColor: "#cbd5e1",
      fillOpacity: 0.28,
    }),
    []
  );

  if (!geojson) return null;

  return (
    <GeoJSON
      data={geojson}
      style={style}
      interactive={true}
      onEachFeature={(feature, layer) => {
        const name =
          feature?.properties?.ST_NM ||
          feature?.properties?.STATE ||
          feature?.properties?.name ||
          "State";
        layer.bindTooltip(String(name), { sticky: true, direction: "top", className: "pm-tip" });
      }}
    />
  );
}

/* ----------------------------------------------------------------
   3.  Fit + constrain map to India on first load
   ---------------------------------------------------------------- */
function FitIndia() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(INDIA_BOUNDS, { padding: [12, 12] });
    map.setMaxBounds(INDIA_BOUNDS);
    map.setMinZoom(4);
  }, [map]);
  return null;
}

/* ----------------------------------------------------------------
   4.  Monitoring markers — 24px, numbered by risk score, haloed,
       accessible. Coordinates are NEVER altered; only presentation.
   ---------------------------------------------------------------- */
function markerIcon(band, selected, score) {
  const cls = `pm-dot pm-dot--${band.level.toLowerCase()}${selected ? " pm-dot--selected" : ""}`;
  const glyph = Number.isFinite(Number(score)) ? Number(score) : "";
  return L.divIcon({
    className: "pm-wrap",
    html: `<span class="${cls}" aria-hidden="true">${glyph}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -13],
    tooltipAnchor: [0, -13],
  });
}

function ProjectMarkers({ projects, selectedId, onSelect, onProjectClick }) {
  return projects.map((project) => {
    const band = riskBand(project.riskScore);
    const selected = selectedId === project.id;
    return (
      <Marker
        key={project.id}
        position={[project.lat, project.lng]}
        icon={markerIcon(band, selected, project.riskScore)}
        keyboard={true}
        title={`${project.name} — ${band.level} risk (${project.riskScore})`}
        eventHandlers={{
          click: () => onSelect(project.id),
        }}
      >
        <Tooltip direction="top" offset={[0, -16]} className="pm-tip" sticky>
          <strong>{project.name}</strong>
          <br />
          Risk: {band.level}
          <br />
          Score: {project.riskScore}
        </Tooltip>
        <Popup>
          <div className="map-popup">
            <p className="map-popup__title">{project.name}</p>
            <div className="map-popup__signals">
              <RiskBadge level={band.level} score={project.riskScore} />
              {project.status ? (
                <span className={`badge ${statusToneClass(project.status)}`}>
                  {project.status}
                </span>
              ) : null}
            </div>
            {project.progress !== undefined ? (
              <ProgressBar label="Progress" progress={project.progress} />
            ) : null}
            <table>
              <tbody>
                <tr>
                  <td>State</td>
                  <td>{project.state}</td>
                </tr>
                <tr>
                  <td>Sector</td>
                  <td>{project.sector}</td>
                </tr>
                <tr>
                  <td>Risk score</td>
                  <td className="num">{project.riskScore}/100</td>
                </tr>
                {project.budget ? (
                  <tr>
                    <td>Budget</td>
                    <td>{formatBudgetCr(project.budget)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            <button
              type="button"
              className="btn btn--primary btn--sm btn--block"
              onClick={() => onProjectClick(project)}
            >
              View Project Details
            </button>
          </div>
        </Popup>
      </Marker>
    );
  });
}

/* ----------------------------------------------------------------
   5.  Legend — band name + score range, rendered below the map so it
       never covers zoom controls or markers.
   ---------------------------------------------------------------- */
function RiskLegend() {
  return (
    <div className="map-legend" role="list" aria-label="Risk legend">
      {RISK_BANDS.map((band, i) => {
        const lo = i === 0 ? 0 : RISK_BANDS[i - 1].max + 1;
        const range = `${lo}–${band.max}`;
        return (
          <span key={band.label} className="map-legend__item" role="listitem">
            <span
              className="map-legend__swatch"
              style={{ backgroundColor: band.color }}
              aria-hidden="true"
            />
            <strong>{band.level.toUpperCase()}</strong>
            <span className="map-legend__range">{range}</span>
          </span>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------
   6.  Main <IndiaMap /> export — panel header (title, live status,
       reset control) + map + legend + attribution note.
   ---------------------------------------------------------------- */
export default function IndiaMap({
  projects = [],
  onProjectClick,
  title = "Project Map",
  subtitle = "Infrastructure projects across India",
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [map, setMap] = useState(null);
  const [riskFilter, setRiskFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  // Stable fallback: without this, every render would hand the marker
  // layer a new callback identity and force all icons to rebuild.
  const handleClick = useMemo(() => onProjectClick || (() => {}), [onProjectClick]);

  const validProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p &&
          Number.isFinite(Number(p.lat)) &&
          Number.isFinite(Number(p.lng))
      ),
    [projects]
  );

  // Distinct states, derived from the dataset — no hardcoded list.
  const states = useMemo(
    () =>
      [...new Set(validProjects.map((p) => p.state).filter(Boolean))].sort(),
    [validProjects]
  );

  // Counts derived from the actual dataset, not duplicated constants.
  const counts = useMemo(() => {
    const c = { total: validProjects.length, Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const p of validProjects) {
      const level = riskBand(p.riskScore).level;
      if (c[level] !== undefined) c[level] += 1;
    }
    return c;
  }, [validProjects]);

  // Filtering is memoized: markers re-derive only when data or filters change.
  const filteredProjects = useMemo(
    () =>
      validProjects.filter((p) => {
        const matchesRisk =
          riskFilter === "All" || riskBand(p.riskScore).level === riskFilter;
        const matchesState = stateFilter === "All" || p.state === stateFilter;
        return matchesRisk && matchesState;
      }),
    [validProjects, riskFilter, stateFilter]
  );

  // A selection whose marker is filtered out simply stops matching —
  // derived during render, no effect or cascading setState needed.
  const effectiveSelectedId = filteredProjects.some((p) => p.id === selectedId)
    ? selectedId
    : null;

  // The marker layer re-derives only when its inputs change — typing
  // in a filter box or toggling UI state elsewhere never rebuilds icons,
  // which keeps pan/zoom at Leaflet's native smoothness.
  const markerLayer = useMemo(
    () =>
      filteredProjects.length > 0 ? (
        <ProjectMarkers
          projects={filteredProjects}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          onProjectClick={handleClick}
        />
      ) : null,
    [filteredProjects, effectiveSelectedId, handleClick]
  );

  const selectedProject = useMemo(
    () => filteredProjects.find((p) => p.id === effectiveSelectedId) || null,
    [filteredProjects, effectiveSelectedId]
  );

  function resetView() {
    if (map) map.fitBounds(INDIA_BOUNDS, { padding: [12, 12] });
  }

  const filtersActive = riskFilter !== "All" || stateFilter !== "All";

  function resetFilters() {
    setRiskFilter("All");
    setStateFilter("All");
  }

  const statusText = selectedProject
    ? `Selected: ${selectedProject.name}`
    : filtersActive
      ? `Showing ${filteredProjects.length} of ${counts.total} projects`
      : `${counts.total} project${counts.total === 1 ? "" : "s"} plotted` +
        ` · ${counts.Critical} critical · ${counts.High} high`;

  return (
    <div>
      <div className="map-shell">
        <div className="map-panel__head">
          <div className="map-panel__titles">
            <h2 className="map-panel__title">{title}</h2>
            <p className="map-panel__sub">{subtitle}</p>
          </div>
          <div className="map-panel__actions">
            <span className="map-panel__count" aria-live="polite">
              {statusText}
            </span>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={resetView}
              disabled={!map}
              aria-label="Reset map view to India"
            >
              Reset India View
            </button>
          </div>
        </div>
        <div className="map-stats" role="group" aria-label="Project counts by risk level">
          <span className="map-stat">
            <span className="map-stat__value">{counts.total}</span>
            <span className="map-stat__label">Total</span>
          </span>
          {["Low", "Medium", "High", "Critical"].map((level) => (
            <span key={level} className="map-stat">
              <span
                className={`map-stat__dot map-stat__dot--${level.toLowerCase()}`}
                aria-hidden="true"
              />
              <span className="map-stat__value">{counts[level]}</span>
              <span className="map-stat__label">{level}</span>
            </span>
          ))}
        </div>
        <div className="map-filters">
          <span className="map-filters__label" id="map-risk-filter">
            Risk
          </span>
          <div className="seg-group" role="group" aria-labelledby="map-risk-filter">
            {["All", "Low", "Medium", "High", "Critical"].map((level) => (
              <button
                key={level}
                type="button"
                className={`seg-btn${riskFilter === level ? " seg-btn--active" : ""}`}
                aria-pressed={riskFilter === level}
                onClick={() => setRiskFilter(level)}
              >
                {level !== "All" && (
                  <span
                    className={`seg-btn__dot seg-btn__dot--${level.toLowerCase()}`}
                    aria-hidden="true"
                  />
                )}
                {level}
              </button>
            ))}
          </div>
          <label className="map-filters__label" htmlFor="map-state-filter">
            State
          </label>
          <select
            id="map-state-filter"
            className="select map-filters__select"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="All">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={resetFilters}
            disabled={!filtersActive}
          >
            Reset filters
          </button>
        </div>
        {filteredProjects.length === 0 && (
          <p className="map-empty" role="status">
            No projects match the current filters. Reset filters to see all
            projects.
          </p>
        )}
        <MapContainer
          center={INDIA_CENTER}
          zoom={5}
          scrollWheelZoom={true}
          className="india-map"
          aria-label="Map of infrastructure projects across India"
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <FitIndia />
          <StateBoundaries />
          {markerLayer}
        </MapContainer>
        <RiskLegend />
      </div>
      <p className="map-note">
        Base map © OpenStreetMap contributors · State boundaries shown
        where available · Showing {filteredProjects.length} of{" "}
        {validProjects.length} projects.
      </p>
    </div>
  );
}
