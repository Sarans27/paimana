// src/components/Mapview.jsx
// Interactive India map with project markers colored by risk score.
//
// PROPS:
//   projects       — array of project objects (must have lat, lng, riskScore)
//   onProjectClick — function called with (project) when "View Details" is clicked
//
// This component is REUSABLE — it doesn't fetch data or handle routing.
// The parent page (MapPage.jsx) handles that.

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ----------------------------------------------------------------
   1.  Risk-score → colour mapping
   ---------------------------------------------------------------- */
const RISK_BANDS = [
  { max: 30,  color: "#22c55e", label: "Low (0–30)" },
  { max: 55,  color: "#f59e0b", label: "Medium (31–55)" },
  { max: 75,  color: "#f97316", label: "High (56–75)" },
  { max: 100, color: "#ef4444", label: "Critical (76–100)" },
];

function riskColor(score) {
  for (const band of RISK_BANDS) {
    if (score <= band.max) return band.color;
  }
  return "#94a3b8"; // fallback grey
}

/* ----------------------------------------------------------------
   2.  GeoJSON layer for Indian state boundaries
       Fetched once from a public GitHub gist
   ---------------------------------------------------------------- */
const INDIA_GEOJSON_URL =
  "https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson";

function StateBoundaries() {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    fetch(INDIA_GEOJSON_URL)
      .then((r) => r.json())
      .then(setGeojson)
      .catch(console.error);
  }, []);

  if (!geojson) return null;

  return (
    <GeoJSON
      data={geojson}
      style={() => ({
        color: "#4b5563",
        weight: 1,
        fillColor: "#e2e8f0",
        fillOpacity: 0.25,
      })}
      onEachFeature={(feature, layer) => {
        layer.bindTooltip(feature.properties.ST_NM, {
          sticky: true,
        });
      }}
    />
  );
}

/* ----------------------------------------------------------------
   3.  Fit map bounds to India on first load
   ---------------------------------------------------------------- */
function FitIndia() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([
      [6.5, 68.1],   // Southwest corner
      [37.1, 97.4],  // Northeast corner
    ]);
  }, [map]);
  return null;
}

/* ----------------------------------------------------------------
   4.  Project markers — colored circles at project coordinates
   ---------------------------------------------------------------- */
function ProjectMarkers({ projects, onProjectClick }) {
  return projects.map((project) => (
    <CircleMarker
      key={project.id}
      center={[project.lat, project.lng]}
      radius={9}
      pathOptions={{
        color: "#fff",
        weight: 2,
        fillColor: riskColor(project.riskScore),
        fillOpacity: 0.9,
      }}
    >
      {/* Popup appears when you click the marker */}
      <Popup>
        <div style={{ minWidth: 220, fontFamily: "system-ui, sans-serif" }}>
          <h4 style={{ margin: "0 0 8px", fontSize: "15px" }}>{project.name}</h4>

          <table style={{ fontSize: 13, borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#888" }}>Sector</td>
                <td style={{ fontWeight: "bold" }}>{project.sector}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#888" }}>State</td>
                <td style={{ fontWeight: "bold" }}>{project.state}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#888" }}>Status</td>
                <td style={{ fontWeight: "bold" }}>{project.status}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#888" }}>Progress</td>
                <td style={{ fontWeight: "bold" }}>{project.progress}%</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 8px 2px 0", color: "#888" }}>Risk Score</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: riskColor(project.riskScore),
                      marginRight: 4,
                    }}
                  />
                  <strong>{project.riskScore}</strong>
                </td>
              </tr>
              {project.budget && (
                <tr>
                  <td style={{ padding: "2px 8px 2px 0", color: "#888" }}>Budget</td>
                  <td style={{ fontWeight: "bold" }}>₹{project.budget.toLocaleString()} Cr</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* "View Details" button inside the popup */}
          <button
            onClick={() => onProjectClick(project)}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "6px 0",
              fontSize: "13px",
              backgroundColor: "#1a1a2e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            View Details →
          </button>
        </div>
      </Popup>
    </CircleMarker>
  ));
}

/* ----------------------------------------------------------------
   5.  Legend component (rendered below the map)
   ---------------------------------------------------------------- */
function RiskLegend() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 20,
        padding: "14px 0",
        fontSize: 14,
      }}
    >
      {RISK_BANDS.map((band) => (
        <span key={band.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: band.color,
              border: "1px solid #d1d5db",
              display: "inline-block",
            }}
          />
          {band.label}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------
   6.  Main <IndiaMap /> export
   ---------------------------------------------------------------- */
export default function IndiaMap({ projects = [], onProjectClick }) {
  // Default click handler logs to console if none provided
  const handleClick = onProjectClick || ((p) => console.log("Selected project:", p));

  return (
    <div>
      <MapContainer
        center={[22.5, 82]}
        zoom={5}
        style={{ height: "70vh", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitIndia />
        <StateBoundaries />
        {projects.length > 0 && (
          <ProjectMarkers projects={projects} onProjectClick={handleClick} />
        )}
      </MapContainer>

      <RiskLegend />
    </div>
  );
}