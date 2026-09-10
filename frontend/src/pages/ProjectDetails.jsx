// src/pages/ProjectDetails.jsx
// Project intelligence record: breadcrumbs, signal header, and structured
// sections (Overview, Status, Progress, Risk, Key Details, Location,
// Timeline, Actions). Every value comes from the project record or is
// derived from it — nothing is fabricated.

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProjectById } from "../services/api";
import { normalizeRiskLevel } from "../utils/risk";
import { statusToneClass } from "../utils/status";
import { formatBudgetCr, formatDate } from "../utils/format";
import { ErrorState } from "../components/Feedback";
import { DetailsSkeleton } from "../components/Skeletons";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";

function timelineInfo(project) {
  const start = project.startDate ? new Date(`${project.startDate}T00:00:00`) : null;
  const end = project.deadline ? new Date(`${project.deadline}T00:00:00`) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const months = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (30.44 * 86400000))
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remainingDays = Math.round((end.getTime() - today.getTime()) / 86400000);
  const remaining =
    project.status === "Completed"
      ? "Completed"
      : remainingDays < 0
        ? `Overdue by ${Math.abs(remainingDays)} days`
        : remainingDays === 0
          ? "Due today"
          : `${remainingDays} days remaining`;
  return { months, remaining };
}

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  async function loadProject() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch {
      setError("This project record could not be loaded. It may not exist or the registry may be unreachable.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/projects">Projects</Link>
          <span aria-hidden="true">/</span>
          <span>Loading…</span>
        </nav>
        <DetailsSkeleton />
        <p className="sr-only" role="status">Loading project…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/projects">Projects</Link>
          <span aria-hidden="true">/</span>
          <span>Not found</span>
        </nav>
        <ErrorState
          title="Failed to load project"
          message={error || "Project not found."}
          onRetry={loadProject}
        />
      </div>
    );
  }

  const band = normalizeRiskLevel(project.risk, project.riskScore);
  const progressGap = (Number(project.progress) || 0) - (Number(project.expectedProgress) || 0);
  const timeline = timelineInfo(project);
  const hasCoords =
    Number.isFinite(Number(project.lat)) && Number.isFinite(Number(project.lng));

  return (
    <div>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/projects">Projects</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{project.name}</span>
      </nav>

      <div className="page-head">
        <p className="page-head__eyebrow">
          {project.sector} &nbsp;•&nbsp; {project.state} &nbsp;•&nbsp; ID {project.id}
        </p>
        <h1>{project.name}</h1>
        <div className="detail-signals">
          {project.status ? (
            <span className={`badge ${statusToneClass(project.status)}`}>
              {project.status}
            </span>
          ) : null}
          <RiskBadge level={project.risk} score={project.riskScore} />
          {project.riskScore !== undefined && project.riskScore !== null && project.riskScore !== "" ? (
            <span className="detail-score num">Score {project.riskScore}/100</span>
          ) : null}
          {project.progress !== undefined ? (
            <span className="detail-progress num">{project.progress}% complete</span>
          ) : null}
        </div>
      </div>

      <div className="grid grid--2col">
        <section className="card card__pad" aria-labelledby="pd-overview">
          <h2 className="card__title" id="pd-overview">Project Overview</h2>
          {project.department ? (
            <p className="detail-dept">{project.department}</p>
          ) : null}
          {project.description ? (
            <p className="detail-desc">{project.description}</p>
          ) : (
            <p className="meta">No overview text is registered for this project.</p>
          )}
        </section>

        <section className="card card__pad" aria-labelledby="pd-status">
          <h2 className="card__title" id="pd-status">Project Status</h2>
          <div className="kv">
            <span className="kv__label">Status</span>
            <span className={`badge ${statusToneClass(project.status)}`}>
              {project.status || "—"}
            </span>
          </div>
          <div className="kv">
            <span className="kv__label">Overall risk</span>
            <RiskBadge level={project.risk} score={project.riskScore} />
          </div>
          <div className="kv">
            <span className="kv__label">Risk band</span>
            <span className="kv__value">{band}</span>
          </div>
          {project.expectedProgress !== undefined && (
            <p
              className="detail-gap"
              style={{ color: progressGap >= 0 ? "var(--success)" : "var(--danger)" }}
            >
              {progressGap >= 0
                ? `${progressGap}% ahead of schedule`
                : `${Math.abs(progressGap)}% behind schedule`}
            </p>
          )}
        </section>
      </div>

      <div className="grid grid--2col">
        <section className="card card__pad" aria-labelledby="pd-progress">
          <h2 className="card__title" id="pd-progress">Progress</h2>
          <ProgressBar label="Actual progress" progress={project.progress} />
          {project.expectedProgress !== undefined && (
            <ProgressBar label="Expected progress" progress={project.expectedProgress} />
          )}
          {project.keyMilestones && project.keyMilestones.length > 0 && (
            <div className="detail-miles">
              <h3 className="detail-subhead">Key milestones</h3>
              {project.keyMilestones.map((milestone, index) => {
                const tone =
                  milestone.status === "Done" ? "badge--low"
                  : milestone.status === "In Progress" ? "badge--medium"
                  : "badge--high";
                return (
                  <div key={`${milestone.name}-${index}`} className="kv">
                    <span>{milestone.name}</span>
                    <span className={`badge ${tone}`}>{milestone.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card card__pad" aria-labelledby="pd-risk">
          <h2 className="card__title" id="pd-risk">Risk</h2>
          {project.riskBreakdown ? (
            Object.entries(project.riskBreakdown).map(([category, level]) => (
              <div key={category} className="kv">
                <span className="kv__label detail-cap">{category}</span>
                <RiskBadge level={level} />
              </div>
            ))
          ) : (
            <p className="meta">No risk breakdown is registered for this project.</p>
          )}
        </section>
      </div>

      <div className="grid grid--2col">
        <section className="card card__pad" aria-labelledby="pd-details">
          <h2 className="card__title" id="pd-details">Key Details</h2>
          <div className="kv"><span className="kv__label">Project ID</span><span className="kv__value num">{project.id}</span></div>
          <div className="kv"><span className="kv__label">Sector</span><span className="kv__value">{project.sector}</span></div>
          <div className="kv"><span className="kv__label">State</span><span className="kv__value">{project.state}</span></div>
          <div className="kv"><span className="kv__label">Department</span><span className="kv__value detail-wrap">{project.department || "—"}</span></div>
          <div className="kv"><span className="kv__label">Budget</span><span className="kv__value">{project.budget ? formatBudgetCr(project.budget) : "—"}</span></div>
          <div className="kv"><span className="kv__label">Start date</span><span className="kv__value">{formatDate(project.startDate)}</span></div>
          <div className="kv"><span className="kv__label">Deadline</span><span className="kv__value">{formatDate(project.deadline)}</span></div>
        </section>

        <section className="card card__pad" aria-labelledby="pd-location">
          <h2 className="card__title" id="pd-location">Location</h2>
          <div className="kv"><span className="kv__label">State</span><span className="kv__value">{project.state}</span></div>
          <div className="kv">
            <span className="kv__label">Coordinates</span>
            <span className="kv__value num">
              {hasCoords
                ? `${Number(project.lat).toFixed(2)}° N, ${Number(project.lng).toFixed(2)}° E`
                : "—"}
            </span>
          </div>
          <p className="meta">Plotted at registered coordinates on the national project map.</p>
        </section>
      </div>

      <div className="grid grid--2col">
        {timeline && (
          <section className="card card__pad" aria-labelledby="pd-timeline">
            <h2 className="card__title" id="pd-timeline">Timeline</h2>
            <div className="kv"><span className="kv__label">Start</span><span className="kv__value">{formatDate(project.startDate)}</span></div>
            <div className="kv"><span className="kv__label">Deadline</span><span className="kv__value">{formatDate(project.deadline)}</span></div>
            <div className="kv"><span className="kv__label">Planned duration</span><span className="kv__value num">{timeline.months} months</span></div>
            <div className="kv"><span className="kv__label">Schedule</span><span className="kv__value">{timeline.remaining}</span></div>
          </section>
        )}
        <section className="card card__pad" aria-labelledby="pd-actions">
          <h2 className="card__title" id="pd-actions">Actions</h2>
          <div className="detail-actions">
            <button type="button" className="btn btn--primary" onClick={() => navigate("/map")}>
              Open in Project Map →
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => navigate("/projects")}>
              ← Back to Projects
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProjectDetails;
