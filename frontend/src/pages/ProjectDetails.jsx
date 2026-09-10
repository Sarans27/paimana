// src/pages/ProjectDetails.jsx
// Shows detailed information for a SINGLE project.
//
// HOW IT WORKS:
// 1. useParams() reads the :id from the URL (e.g., /projects/3 → id = "3")
// 2. useEffect() triggers the API call when the page loads
// 3. getProjectById(id) fetches the project data
// 4. The page renders Loading / Error / Success based on state

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById } from "../services/api";
import Loading from "../components/Loading";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";

// ===== STYLES =====

const BLUE = "#0B3D91";
const ORANGE = "#E8620C";

const backButtonStyle = {
  padding: "8px 16px",
  fontSize: "14px",
  backgroundColor: "transparent",
  border: `1px solid ${BLUE}`,
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "20px",
  color: BLUE,
  fontWeight: "bold",
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  marginBottom: "20px",
};

const cardTitleStyle = {
  margin: "0 0 16px",
  fontSize: "18px",
  fontWeight: "bold",
  color: BLUE,
};

const gridTwoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginBottom: "20px",
};

const infoRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "14px",
};

const labelStyle = {
  color: "#888",
};

const valueStyle = {
  fontWeight: "bold",
};

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

const statusDotStyle = (status) => ({
  display: "inline-block",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  marginRight: "6px",
  backgroundColor:
    status === "Active" ? "#27ae60" :
    status === "Delayed" ? "#e74c3c" :
    status === "Completed" ? "#4a90d9" : "#888",
});

const milestoneRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "14px",
};

const milestoneBadgeStyle = (status) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "bold",
  backgroundColor:
    status === "Done" ? "#e8f8ef" :
    status === "In Progress" ? "#fef3e2" : "#f0f0f0",
  color:
    status === "Done" ? "#27ae60" :
    status === "In Progress" ? "#f39c12" : "#888",
});

// ===== HELPER: Format currency in Crores =====
function formatBudget(crores) {
  if (crores >= 10000) {
    return `₹${(crores / 100).toFixed(0)} Bn (₹${crores.toLocaleString()} Cr)`;
  }
  return `₹${crores.toLocaleString()} Cr`;
}

// ===== PROJECT DETAILS PAGE =====

function ProjectDetails() {
  // ----- READ THE :id FROM THE URL -----
  // useParams() returns an object with all the dynamic route params.
  // Our route is /projects/:id, so params has { id: "3" } (always a string).
  const { id } = useParams();

  // ----- NAVIGATION -----
  const navigate = useNavigate();

  // ----- DATA LOADING STATE -----
  const [project, setProject] = useState(null);  // null = not loaded yet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----- LOAD DATA WHEN PAGE OPENS (or when id changes) -----
  useEffect(() => {
    loadProject();
  }, [id]);  // ← re-run if the id in the URL changes

  async function loadProject() {
    setLoading(true);
    setError(null);

    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ===== RENDER =====

  // ----- LOADING STATE -----
  if (loading) {
    return (
      <div>
        <button onClick={() => navigate("/projects")} style={backButtonStyle}>
          ← Back to Projects
        </button>
        <Loading />
      </div>
    );
  }

  // ----- ERROR STATE -----
  if (error) {
    return (
      <div>
        <button onClick={() => navigate("/projects")} style={backButtonStyle}>
          ← Back to Projects
        </button>
        <div style={errorBoxStyle}>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>
            ⚠️ Failed to load project
          </p>
          <p>{error}</p>
          <button onClick={loadProject} style={retryButtonStyle}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ----- SUCCESS STATE -----
  // At this point, project is guaranteed to exist.

  // Calculate the progress gap (how far behind or ahead)
  const progressGap = project.progress - (project.expectedProgress || 0);

  return (
    <div>
      {/* ===== BACK BUTTON ===== */}
      <button onClick={() => navigate("/projects")} style={backButtonStyle}>
        ← Back to Projects
      </button>

      {/* ===== PAGE HEADER ===== */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, color: BLUE }}>{project.name}</h1>
          <RiskBadge level={project.risk} />
        </div>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: "14px" }}>
          Project ID: {project.id} &nbsp;|&nbsp; {project.sector} &nbsp;|&nbsp; {project.state}
        </p>
      </div>

      {/* ===== ROW 1: PROJECT INFO + STATUS ===== */}
      <div style={gridTwoCol}>

        {/* ----- Project Information Card ----- */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>📋 Project Information</h2>

          <div style={infoRowStyle}>
            <span style={labelStyle}>Department</span>
            <span style={valueStyle}>{project.department || "—"}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Sector</span>
            <span style={valueStyle}>{project.sector}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>State</span>
            <span style={valueStyle}>{project.state}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Budget</span>
            <span style={valueStyle}>
              {project.budget ? formatBudget(project.budget) : "—"}
            </span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Start Date</span>
            <span style={valueStyle}>{project.startDate || "—"}</span>
          </div>
          <div style={{ ...infoRowStyle, borderBottom: "none" }}>
            <span style={labelStyle}>Deadline</span>
            <span style={valueStyle}>{project.deadline || "—"}</span>
          </div>
        </div>

        {/* ----- Status & Progress Card ----- */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>📈 Status & Progress</h2>

          <div style={infoRowStyle}>
            <span style={labelStyle}>Status</span>
            <span style={valueStyle}>
              <span style={statusDotStyle(project.status)} />
              {project.status}
            </span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Overall Risk</span>
            <span><RiskBadge level={project.risk} /></span>
          </div>

          <div style={{ marginTop: "16px" }}>
            <ProgressBar label="Actual Progress" progress={project.progress} />
          </div>

          {project.expectedProgress !== undefined && (
            <div>
              <ProgressBar label="Expected Progress" progress={project.expectedProgress} />

              <p style={{
                margin: "8px 0 0",
                fontSize: "14px",
                fontWeight: "bold",
                color: progressGap >= 0 ? "#27ae60" : "#e74c3c",
              }}>
                {progressGap >= 0
                  ? `✅ ${progressGap}% ahead of schedule`
                  : `⚠️ ${Math.abs(progressGap)}% behind schedule`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== ROW 2: DESCRIPTION ===== */}
      {project.description && (
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>📝 Description</h2>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "#444" }}>
            {project.description}
          </p>
        </div>
      )}

      {/* ===== ROW 3: RISK BREAKDOWN + KEY MILESTONES ===== */}
      <div style={gridTwoCol}>

        {/* ----- Risk Breakdown Card ----- */}
        {project.riskBreakdown && (
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>⚠️ Risk Breakdown</h2>
            {Object.entries(project.riskBreakdown).map(([category, level]) => (
              <div key={category} style={infoRowStyle}>
                <span style={{ ...labelStyle, textTransform: "capitalize" }}>
                  {category}
                </span>
                <RiskBadge level={level} />
              </div>
            ))}
          </div>
        )}

        {/* ----- Key Milestones Card ----- */}
        {project.keyMilestones && (
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>🎯 Key Milestones</h2>
            {project.keyMilestones.map((milestone, index) => (
              <div key={index} style={milestoneRowStyle}>
                <span>{milestone.name}</span>
                <span style={milestoneBadgeStyle(milestone.status)}>
                  {milestone.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;
