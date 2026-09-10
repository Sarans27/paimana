// src/pages/PublicDashboard.jsx
// Read-only public dashboard — shows stats, recent projects, and the India map.
// Fetches data from the API (mock mode for now).

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getProjects } from "../services/api";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import IndiaMap from "../components/Mapview";

const BLUE = "#0B3D91";

const errorBoxStyle = {
  textAlign: "center",
  padding: "40px",
  backgroundColor: "#fde8e8",
  borderRadius: "8px",
  color: "#e74c3c",
};

const sectionStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  marginBottom: "24px",
};

const sectionTitleStyle = {
  margin: "0 0 16px",
  fontSize: "18px",
  fontWeight: "bold",
  color: BLUE,
};

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
      // Fetch dashboard stats and full project list in parallel
      const [dashboard, projects] = await Promise.all([
        getDashboard(),
        getProjects(),
      ]);
      setDashData(dashboard);
      setMapProjects(projects.filter((p) => p.lat && p.lng));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 style={{ margin: "0 0 4px", color: BLUE }}>🏛 PAIMANA — Public Dashboard</h1>
        <p style={{ margin: "0 0 24px", color: "#6B7280" }}>
          Infrastructure Project Monitoring System
        </p>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ margin: "0 0 4px", color: BLUE }}>🏛 PAIMANA — Public Dashboard</h1>
        <div style={errorBoxStyle}>
          <p style={{ fontWeight: "bold", fontSize: "18px" }}>⚠️ Failed to load dashboard</p>
          <p>{error}</p>
          <button onClick={loadData} style={{
            marginTop: "12px", padding: "8px 20px", fontSize: "14px",
            backgroundColor: "#e74c3c", color: "white", border: "none",
            borderRadius: "6px", cursor: "pointer",
          }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 4px", color: BLUE }}>🏛 PAIMANA — Public Dashboard</h1>
      <p style={{ margin: "0 0 24px", color: "#6B7280" }}>
        Infrastructure Project Monitoring System — Read-Only View
      </p>

      {/* Stats Row */}
      {dashData?.stats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          {dashData.stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>
      )}

      {/* India Map */}
      {mapProjects.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🗺️ Project Locations</h2>
          <IndiaMap
            projects={mapProjects}
            onProjectClick={(p) => setModalProject(p)}
          />
        </div>
      )}

      {/* Recent Projects */}
      {dashData?.recentProjects && (
        <div style={{ marginBottom: "24px" }}>
          <h2 style={sectionTitleStyle}>📋 Recent Projects</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {dashData.recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onQuickView={(p) => setModalProject(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Project Modal */}
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
