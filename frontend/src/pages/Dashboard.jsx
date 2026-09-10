// src/pages/Dashboard.jsx
// Admin command dashboard — every number derived from the project dataset.

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../services/api";
import { normalizeRiskLevel, RISK_BANDS } from "../utils/risk";
import { calculateProjectStats, recentByStartDate } from "../utils/stats";
import { ErrorState, EmptyState } from "../components/Feedback";
import { DashboardSkeleton } from "../components/Skeletons";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";
import ProjectModal from "../components/ProjectModal";

/* Restrained stroke icons — geometric, 16px, currentColor. No emoji. */
function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="5.2" height="5.2" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9.3" y="1.5" width="5.2" height="5.2" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="1.5" y="9.3" width="5.2" height="5.2" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9.3" y="9.3" width="5.2" height="5.2" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <polyline points="1.5,8.5 5,8.5 7,4.5 9.5,12 11.5,8.5 14.5,8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M8 2 L14.5 13.5 H1.5 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="8" y1="6.5" x2="8" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <polyline points="8,5 8,8.2 10.2,9.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalProject, setModalProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("The dashboard data could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => calculateProjectStats(projects), [projects]);

  const riskDistribution = useMemo(
    () =>
      RISK_BANDS.map((band) => {
        const count = metrics.byBand[band.level] || 0;
        const pct = metrics.total ? Math.round((count / metrics.total) * 100) : 0;
        return { ...band, count, pct };
      }),
    [metrics]
  );

  const recentProjects = useMemo(() => recentByStartDate(projects, 3), [projects]);

  // Portfolio watchlist: high/critical band OR delayed status. Derived,
  // deduplicated — the dashboard's "what needs me?" answer in 3 seconds.
  const attention = useMemo(
    () =>
      projects.filter((p) => {
        const band = normalizeRiskLevel(p.risk, p.riskScore);
        return band === "High" || band === "Critical" || p.status === "Delayed";
      }),
    [projects]
  );

  const stats = [
    {
      label: "Total Projects",
      value: metrics.total,
      accent: "var(--gov-blue)",
      icon: <IconGrid />,
      hint: `${metrics.stateCount} states · ${metrics.sectorCount} sectors`,
    },
    {
      label: "Active Projects",
      value: metrics.active,
      accent: "var(--success)",
      icon: <IconActivity />,
      hint: metrics.total ? `${Math.round((metrics.active / metrics.total) * 100)}% of portfolio` : "—",
    },
    {
      label: "High Risk",
      value: metrics.highRisk,
      accent: "var(--danger)",
      icon: <IconAlert />,
      hint: "High + Critical bands",
    },
    {
      label: "Delayed Projects",
      value: metrics.delayed,
      accent: "var(--warning)",
      icon: <IconClock />,
      hint: metrics.total ? `${Math.round((metrics.delayed / metrics.total) * 100)}% behind schedule` : "—",
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="page-head">
          <p className="page-head__eyebrow">National portfolio</p>
          <h1>PAIMANA Project Intelligence Dashboard</h1>
          <p>Government Infrastructure Project Monitoring System — national project portfolio overview.</p>
        </div>
        <DashboardSkeleton />
        <p className="sr-only" role="status">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-head">
          <p className="page-head__eyebrow">National portfolio</p>
          <h1>PAIMANA Project Intelligence Dashboard</h1>
          <p>Government Infrastructure Project Monitoring System — national project portfolio overview.</p>
        </div>
        <ErrorState
          title="Failed to load dashboard"
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
          <p className="page-head__eyebrow">National portfolio</p>
          <h1>PAIMANA Project Intelligence Dashboard</h1>
          <p>Government Infrastructure Project Monitoring System — national project portfolio overview.</p>
        </div>
        <EmptyState
          title="No projects yet"
          message="No projects are registered in this view."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <p className="page-head__eyebrow">National portfolio</p>
            <h1>PAIMANA Project Intelligence Dashboard</h1>
            <p>Government Infrastructure Project Monitoring System — national project portfolio overview.</p>
          </div>
          <button type="button" className="btn btn--secondary" onClick={() => navigate("/map")}>
            Open Project Map →
          </button>
        </div>
      </div>

      <div className="grid grid--stats">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            color={stat.accent}
            hint={stat.hint}
            icon={stat.icon}
          />
        ))}
      </div>

      {attention.length > 0 ? (
        <div className="attention-strip attention-strip--warn" role="note" aria-label="Projects needing attention">
          <span className="attention-strip__icon" aria-hidden="true">
            <IconAlert />
          </span>
          <p className="attention-strip__text">
            <strong>
              {attention.length} of {metrics.total} projects need attention
            </strong>
            <span>
              {" "}— {metrics.highRisk} high-risk · {metrics.delayed} delayed.
            </span>
          </p>
          <button
            type="button"
            className="btn btn--secondary btn--sm attention-strip__action"
            onClick={() => navigate("/projects")}
          >
            Review in registry →
          </button>
        </div>
      ) : (
        <div className="attention-strip attention-strip--ok" role="note" aria-label="Portfolio status">
          <p className="attention-strip__text">
            <strong>Portfolio on track</strong>
            <span> — no high-risk or delayed projects in the registry.</span>
          </p>
        </div>
      )}

      <section className="section" aria-labelledby="recent-projects">
        <h2 id="recent-projects">Recent Projects</h2>
        <div className="grid grid--cards">
          {recentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
              onQuickView={(p) => setModalProject(p)}
            />
          ))}
        </div>
      </section>

      <div className="grid grid--2col">
        <section className="card card__pad" aria-labelledby="risk-overview">
          <h2 className="card__title" id="risk-overview">Risk Overview</h2>
          {riskDistribution.map((item) => (
            <div key={item.level} className="dist-row">
              <RiskBadge level={item.level} />
              <div
                className="dist-row__track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.pct}
                aria-label={`${item.level} risk share`}
              >
                <div
                  className="dist-row__fill"
                  style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="dist-row__value num">
                {item.count} · {item.pct}%
              </span>
            </div>
          ))}
          <p className="meta" style={{ margin: "10px 0 0" }}>
            Share of {metrics.total} monitored projects by risk band.
          </p>
        </section>

        <section className="card card__pad" aria-labelledby="progress-overview">
          <h2 className="card__title" id="progress-overview">Progress Overview</h2>
          <ProgressBar label="Average progress" progress={metrics.avgProgress} />
          <div className="kv">
            <span className="kv__label">Projects above 75%</span>
            <span className="kv__value num">{metrics.above75}</span>
          </div>
          <div className="kv">
            <span className="kv__label">Projects below 25%</span>
            <span className="kv__value num">{metrics.below25}</span>
          </div>
          <div className="kv">
            <span className="kv__label">Delayed projects</span>
            <span className="kv__value num">{metrics.delayed}</span>
          </div>
        </section>
      </div>

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

export default Dashboard;
