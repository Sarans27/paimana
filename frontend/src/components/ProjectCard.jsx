// src/components/ProjectCard.jsx
// Summary card for one project. Visual hierarchy: name → risk →
// progress → status → sector/state metadata, then actions.
//
// Interaction model (accessible): the card body responds to mouse
// clicks, but keyboard and screen-reader users get two explicit,
// equally capable buttons — Quick View and View details. The article
// itself carries no fake link role, so there are no nested-interactive
// or redundant-tab-stop violations.
// Props: project, onClick (View details), onQuickView (modal).

import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";
import { statusToneClass } from "../utils/status";

function ProjectCard({ project, onClick, onQuickView }) {
  const clickable = typeof onClick === "function";

  return (
    <article
      className={`card project-card anim-in${clickable ? " project-card--clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
      aria-label={project.name}
    >
      <h3>{project.name}</h3>
      <div className="project-card__signals">
        {project.risk ? <RiskBadge level={project.risk} score={project.riskScore} /> : null}
        {project.status ? (
          <span className={`badge ${statusToneClass(project.status)}`}>
            {project.status}
          </span>
        ) : null}
      </div>
      {project.progress !== undefined ? (
        <ProgressBar label="Progress" progress={project.progress} />
      ) : null}
      <p className="project-card__meta">
        {project.sector} &nbsp;•&nbsp; {project.state}
      </p>
      <div className="project-card__foot">
        {onQuickView ? (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(project);
            }}
          >
            Quick View
          </button>
        ) : null}
        {clickable ? (
          <button
            type="button"
            className="project-card__cta"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            aria-label={`${project.name} — view details`}
          >
            View details →
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default ProjectCard;
