// src/components/ProjectModal.jsx
// Overlay with project summary. Props: project, onClose, onViewDetails.
// Accessible dialog: Escape closes, Tab cycles inside (focus trap),
// background scroll locks, and focus returns to the invoking element.

import { useEffect, useRef } from "react";
import RiskBadge from "./RiskBadge";
import ProgressBar from "./ProgressBar";
import { formatBudgetCr } from "../utils/format";

function ProjectModal({ project, onClose, onViewDetails }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = dialogRef.current;

    function focusables() {
      if (!node) return [];
      return [...node.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )].filter((el) => !el.disabled);
    }

    // Move focus into the dialog (close button first).
    const first = focusables()[0];
    if (first) first.focus();

    function onKey(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      if (previouslyFocused) previouslyFocused.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        ref={dialogRef}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
        <h2>{project.name}</h2>
        <p className="modal__meta">
          ID: {project.id} &nbsp;|&nbsp; {project.sector} &nbsp;|&nbsp; {project.state}
        </p>
        <div className="kv">
          <span className="kv__label">Status</span>
          <span className="kv__value">{project.status}</span>
        </div>
        <div className="kv">
          <span className="kv__label">Risk</span>
          <RiskBadge level={project.risk} score={project.riskScore} />
        </div>
        {project.budget ? (
          <div className="kv">
            <span className="kv__label">Budget</span>
            <span className="kv__value">{formatBudgetCr(project.budget)}</span>
          </div>
        ) : null}
        {project.department ? (
          <div className="kv">
            <span className="kv__label">Department</span>
            <span className="kv__value" style={{ fontSize: 13, maxWidth: "60%" }}>
              {project.department}
            </span>
          </div>
        ) : null}
        {project.progress !== undefined ? (
          <div style={{ marginTop: 16 }}>
            <ProgressBar label="Progress" progress={project.progress} />
          </div>
        ) : null}
        {project.description ? (
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 12 }}>
            {project.description.length > 200
              ? `${project.description.substring(0, 200)}…`
              : project.description}
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn--primary btn--block"
          style={{ marginTop: 20 }}
          onClick={() => onViewDetails(project)}
        >
          View Full Details →
        </button>
      </div>
    </div>
  );
}

export default ProjectModal;
