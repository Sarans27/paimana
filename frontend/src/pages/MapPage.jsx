// src/pages/MapPage.jsx
// Map page — loads geocoded projects, renders the India map.

import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState, EmptyState } from "../components/Feedback";
import { MapSkeleton } from "../components/Skeletons";
import { getProjects } from "../services/api";

// Leaflet is the heaviest dependency in the app — it loads only when
// this route renders, never on initial boot or unrelated pages.
const IndiaMap = lazy(() => import("../components/Mapview"));

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
      setProjects(data.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))));
    } catch (err) {
      console.error("Failed to load map data:", err);
      setError("The map data could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleProjectClick(project) {
    navigate(`/projects/${project.id}`);
  }

  if (loading) {
    return (
      <div>
        <div className="page-head">
          <p className="page-head__eyebrow">Geography</p>
          <h1>Project Map</h1>
          <p>Infrastructure projects across India, plotted at their registered coordinates.</p>
        </div>
        <MapSkeleton />
        <p className="sr-only" role="status">Loading map data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-head">
          <p className="page-head__eyebrow">Geography</p>
          <h1>Project Map</h1>
          <p>Infrastructure projects across India, plotted at their registered coordinates.</p>
        </div>
        <ErrorState
          title="Failed to load map data"
          message={error}
          onRetry={loadProjects}
        />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <div className="page-head">
          <p className="page-head__eyebrow">Geography</p>
          <h1>Project Map</h1>
          <p>Infrastructure projects across India, plotted at their registered coordinates.</p>
        </div>
        <EmptyState
          title="No projects to map"
          message="No projects with registered coordinates are available right now."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <p className="page-head__eyebrow">Geography</p>
        <h1>Project Map</h1>
        <p>{projects.length} infrastructure projects across India — select a marker to inspect a project, then open its full record.</p>
      </div>
      <Suspense fallback={<MapSkeleton />}>
        <IndiaMap projects={projects} onProjectClick={handleProjectClick} />
      </Suspense>
    </div>
  );
}

export default MapPage;
