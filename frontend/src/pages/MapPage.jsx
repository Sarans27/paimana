// src/pages/MapPage.jsx
// The Map page — loads project data, then renders the India map.
// Clicking "View Details" on a marker navigates to /projects/:id.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IndiaMap from "../components/Mapview";
import Loading from "../components/Loading";
import { getProjects } from "../services/api";

const errorBoxStyle = {
  textAlign: "center",
  padding: "40px",
  backgroundColor: "#fde8e8",
  borderRadius: "8px",
  color: "#e74c3c",
};

const retryButtonStyle = {
  marginTop: "12px",
  padding: "8px 20px",
  fontSize: "14px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

function MapPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const data = await getProjects();
      // Only include projects that have lat/lng coordinates
      const projectsWithCoords = data.filter((p) => p.lat && p.lng);
      setProjects(projectsWithCoords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // When "View Details" is clicked in a marker popup
  function handleProjectClick(project) {
    navigate(`/projects/${project.id}`);
  }

  // ----- LOADING -----
  if (loading) {
    return (
      <div>
        <h1 style={{ margin: "0 0 4px" }}>Project Map</h1>
        <p style={{ margin: "0 0 24px", color: "#666" }}>
          Infrastructure projects across India
        </p>
        <Loading />
      </div>
    );
  }

  // ----- ERROR -----
  if (error) {
    return (
      <div>
        <h1 style={{ margin: "0 0 4px" }}>Project Map</h1>
        <p style={{ margin: "0 0 24px", color: "#666" }}>
          Infrastructure projects across India
        </p>
        <div style={errorBoxStyle}>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>⚠️ Failed to load map data</p>
          <p>{error}</p>
          <button onClick={loadProjects} style={retryButtonStyle}>Try Again</button>
        </div>
      </div>
    );
  }

  // ----- SUCCESS -----
  return (
    <div>
      <h1 style={{ margin: "0 0 4px" }}>Project Map</h1>
      <p style={{ margin: "0 0 16px", color: "#666" }}>
        {projects.length} infrastructure projects across India — click a marker to see details
      </p>

      <IndiaMap projects={projects} onProjectClick={handleProjectClick} />
    </div>
  );
}

export default MapPage;
