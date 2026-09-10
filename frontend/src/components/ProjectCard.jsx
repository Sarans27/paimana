// src/components/ProjectCard.jsx
// A card that shows a single project's summary.
// PAIMANA design: blue left border, orange hover accent.
//
// Props:
//   project     — object with name, sector, state, risk, progress, status
//   onClick     — optional, called when the card body is clicked
//   onQuickView — optional, called when "Quick View" button is clicked

import RiskBadge from "./RiskBadge";

const BLUE = "#0B3D91";
const ORANGE = "#E8620C";

function ProjectCard({ project, onClick, onQuickView }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "16px",
        borderLeft: `4px solid ${BLUE}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        e.currentTarget.style.borderLeftColor = ORANGE;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        e.currentTarget.style.borderLeftColor = BLUE;
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: BLUE }}>
        {project.name}
      </h3>

      <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>
        {project.sector} &nbsp;•&nbsp; {project.state}
      </p>

      {project.status && (
        <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>
          Status: <strong>{project.status}</strong>
        </p>
      )}

      {project.risk && (
        <div style={{ marginTop: "8px" }}>
          <RiskBadge level={project.risk} />
        </div>
      )}

      {project.progress !== undefined && (
        <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#9CA3AF" }}>
          Progress: {project.progress}%
        </p>
      )}

      {/* Quick View button — only shows if onQuickView is provided */}
      {onQuickView && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Don't trigger the card's onClick
            onQuickView(project);
          }}
          style={{
            marginTop: "12px",
            padding: "5px 14px",
            fontSize: "12px",
            fontWeight: "bold",
            backgroundColor: "transparent",
            color: ORANGE,
            border: `1px solid ${ORANGE}`,
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = ORANGE;
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = ORANGE;
          }}
        >
          Quick View
        </button>
      )}
    </div>
  );
}

export default ProjectCard;