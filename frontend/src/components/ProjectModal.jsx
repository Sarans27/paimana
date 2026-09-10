// src/components/ProjectModal.jsx
// A popup overlay that shows project details when you click "Quick View".
//
// PROPS:
//   project  — the project object to display (or null to hide)
//   onClose  — function called when the modal should close
//   onViewDetails — function called when "View Full Details" is clicked

import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";

const BLUE = "#0B3D91";
const ORANGE = "#E8620C";

const closeButtonStyle = {
  position: "absolute",
  top: "12px",
  right: "16px",
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: "#888",
  padding: "4px",
};

const headerStyle = {
  margin: "0 0 4px",
  fontSize: "20px",
  color: BLUE,
  paddingRight: "32px",
};

const metaStyle = {
  fontSize: "13px",
  color: "#6B7280",
  margin: "0 0 20px",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "14px",
};

const labelStyle = { color: "#6B7280" };
const valueStyle = { fontWeight: "bold" };

const viewDetailsButtonStyle = {
  width: "100%",
  padding: "10px",
  fontSize: "15px",
  fontWeight: "bold",
  backgroundColor: ORANGE,
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "20px",
  transition: "background-color 0.2s",
};

function ProjectModal({ project, onClose, onViewDetails }) {
  // If no project, don't render anything
  if (!project) return null;

  return (
    // Clicking the dark overlay closes the modal
    <div className="modal-overlay" onClick={onClose}>
      {/* Clicking INSIDE the modal should NOT close it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Close button (×) */}
        <button onClick={onClose} style={closeButtonStyle}>×</button>

        {/* Header */}
        <h2 style={headerStyle}>{project.name}</h2>
        <p style={metaStyle}>
          ID: {project.id} &nbsp;|&nbsp; {project.sector} &nbsp;|&nbsp; {project.state}
        </p>

        {/* Info rows */}
        <div style={rowStyle}>
          <span style={labelStyle}>Status</span>
          <span style={valueStyle}>{project.status}</span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Risk</span>
          <RiskBadge level={project.risk} />
        </div>

        {project.budget && (
          <div style={rowStyle}>
            <span style={labelStyle}>Budget</span>
            <span style={valueStyle}>₹{project.budget.toLocaleString()} Cr</span>
          </div>
        )}

        {project.department && (
          <div style={rowStyle}>
            <span style={labelStyle}>Department</span>
            <span style={{ ...valueStyle, fontSize: "13px", textAlign: "right", maxWidth: "60%" }}>
              {project.department}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {project.progress !== undefined && (
          <div style={{ marginTop: "16px" }}>
            <ProgressBar label="Progress" progress={project.progress} />
          </div>
        )}

        {/* Description snippet */}
        {project.description && (
          <p style={{ fontSize: "13px", color: "#444", lineHeight: "1.5", marginTop: "12px" }}>
            {project.description.length > 200
              ? project.description.substring(0, 200) + "..."
              : project.description}
          </p>
        )}

        {/* View Full Details button */}
        <button
          onClick={() => onViewDetails(project)}
          style={viewDetailsButtonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#C45209")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = ORANGE)}
        >
          View Full Details →
        </button>
      </div>
    </div>
  );
}

export default ProjectModal;
