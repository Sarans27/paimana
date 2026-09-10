// src/pages/PublicDashboard.jsx
// Read-only public dashboard — stats, map, and recent projects.

import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getProjects } from "../services/api";
import { ErrorState } from "../components/Feedback";
import { StatSkeleton, MapSkeleton, CardSkeleton } from "../components/Skeletons";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";

// Same split as the Map page: Leaflet travels in its own chunk.
const IndiaMap = lazy(() => import("../components/Mapview"));

function PublicDashboard() {
  const [dashData, setDashData] = useState(null);
  const [mapProjects, setMapProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalProject, setModalProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, projects] = await Promise.all([
        getDashboard(),
        getProjects(),
      ]);
      setDashData(dashboard);
      setMapProjects(projects.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))));
    } catch (err) {
      console.error("Failed to load public dashboard:", err);
      setError("The public dashboard could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-head">
          <p className="page-head__eyebrow">Transparency</p>
          <h1>Public Dashboard</h1>
          <p>Read-only national view of infrastructure delivery — open data for citizens and oversight.</p>
        </div>
        <div className="grid grid--stats" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <MapSkeleton />
        <div className="grid grid--cards" style={{ marginTop: 20 }} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <p className="sr-only" role="status">Loading public dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-head">
          <p className="page-head__eyebrow">Transparency</p>
          <h1>Public Dashboard</h1>
          <p>Read-only national view of infrastructure delivery — open data for citizens and oversight.</p>
        </div>
        <ErrorState
          title="Failed to load dashboard"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <p className="page-head__eyebrow">Transparency</p>
        <h1>Public Dashboard</h1>
        <p>Read-only national view of infrastructure delivery — open data for citizens and oversight.</p>
      </div>

      {dashData?.stats && (
        <div className="grid grid--stats">
          {dashData.stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>
      )}

      {mapProjects.length > 0 && (
        <section className="card card__pad section" aria-labelledby="public-map">
          <h2 className="card__title" id="public-map">Project Locations</h2>
          <Suspense fallback={<MapSkeleton />}>
            <IndiaMap
              projects={mapProjects}
              onProjectClick={(p) => setModalProject(p)}
            />
          </Suspense>
        </section>
      )}

      {dashData?.recentProjects && (
        <section className="section" aria-labelledby="public-recent">
          <h2 id="public-recent">Recent Projects</h2>
          <div className="grid grid--cards">
            {dashData.recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onQuickView={(p) => setModalProject(p)}
              />
            ))}
          </div>
        </section>
      )}

      <ProjectModal
        project={modalProject}
        onClose={() => setModalProject(null)}
        onViewDetails={(p) => {
          setModalProject(null);
          navigate(`/projects/${p.id}`);
        }}
      />
    </div>
  );
}

export default PublicDashboard;
