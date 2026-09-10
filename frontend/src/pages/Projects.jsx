// src/pages/Projects.jsx
// Project registry: search + filters (URL-synced), card grid,
// skeleton loading, friendly error, guided empty state.
//
// Debouncing is justified: every keystroke would otherwise rewrite the
// URL search params (history churn) and recompute the filtered list.
// The 300ms pause collapses "Mumbai" from 6 updates to 1.

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import FilterBar from "../components/FilterBar";
import ProjectModal from "../components/ProjectModal";
import { ErrorState, EmptyState } from "../components/Feedback";
import { CardSkeleton } from "../components/Skeletons";
import { getProjects } from "../services/api";
import { normalizeRiskLevel } from "../utils/risk";
import useDebounce from "../hooks/useDebounce";

const LOAD_ERROR_MESSAGE =
  "The project registry could not be reached. Check your connection and try again.";

function PageHead() {
  return (
    <div className="page-head">
      <p className="page-head__eyebrow">Registry</p>
      <h1>Projects</h1>
      <p>Browse and monitor infrastructure projects across the national portfolio.</p>
    </div>
  );
}

function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");
  const [sectorFilter, setSectorFilter] = useState(searchParams.get("sector") || "All");
  const [stateFilter, setStateFilter] = useState(searchParams.get("state") || "All");
  const [riskFilter, setRiskFilter] = useState(searchParams.get("risk") || "All");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "All");

  const debouncedSearch = useDebounce(searchText, 300);

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
      console.error("Failed to load projects:", err);
      setError(LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (sectorFilter !== "All") params.sector = sectorFilter;
    if (stateFilter !== "All") params.state = stateFilter;
    if (riskFilter !== "All") params.risk = riskFilter;
    if (statusFilter !== "All") params.status = statusFilter;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, sectorFilter, stateFilter, riskFilter, statusFilter, setSearchParams]);

  const sectors = useMemo(
    () => [...new Set(projects.map((p) => p.sector).filter(Boolean))].sort(),
    [projects]
  );
  const statesList = useMemo(
    () => [...new Set(projects.map((p) => p.state).filter(Boolean))].sort(),
    [projects]
  );
  const statuses = useMemo(
    () => [...new Set(projects.map((p) => p.status).filter(Boolean))].sort(),
    [projects]
  );

  const handleSearchChange = useCallback((val) => setSearchText(val), []);
  const handleSectorChange = useCallback((val) => setSectorFilter(val), []);
  const handleStateChange = useCallback((val) => setStateFilter(val), []);
  const handleRiskChange = useCallback((val) => setRiskFilter(val), []);
  const handleStatusChange = useCallback((val) => setStatusFilter(val), []);

  const clearFilters = useCallback(() => {
    setSearchText("");
    setSectorFilter("All");
    setStateFilter("All");
    setRiskFilter("All");
    setStatusFilter("All");
  }, []);

  const hasActiveFilters =
    debouncedSearch.trim() !== "" ||
    sectorFilter !== "All" ||
    stateFilter !== "All" ||
    riskFilter !== "All" ||
    statusFilter !== "All";

  const filteredProjects = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.sector.toLowerCase().includes(q) ||
        project.state.toLowerCase().includes(q);
      const matchesSector = sectorFilter === "All" || project.sector === sectorFilter;
      const matchesState = stateFilter === "All" || project.state === stateFilter;
      const level = normalizeRiskLevel(project.risk, project.riskScore);
      const matchesRisk = riskFilter === "All" || level === riskFilter;
      const matchesStatus = statusFilter === "All" || project.status === statusFilter;
      return matchesSearch && matchesSector && matchesState && matchesRisk && matchesStatus;
    });
  }, [projects, debouncedSearch, sectorFilter, stateFilter, riskFilter, statusFilter]);

  if (loading) {
    return (
      <div>
        <PageHead />
        <div className="filterbar" aria-hidden="true">
          <div className="skel skel--search" />
          <div className="skel skel--select" />
          <div className="skel skel--select" />
        </div>
        <div className="grid grid--projects" aria-label="Loading projects">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <p className="sr-only" role="status">Loading projects…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHead />
        <ErrorState
          title="Something went wrong"
          message={error}
          onRetry={loadProjects}
        />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <PageHead />
        <EmptyState
          title="No projects yet"
          message="No projects are registered in this view."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHead />
      <FilterBar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        sectorFilter={sectorFilter}
        onSectorChange={handleSectorChange}
        stateFilter={stateFilter}
        onStateChange={handleStateChange}
        riskFilter={riskFilter}
        onRiskChange={handleRiskChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        sectors={sectors}
        states={statesList}
        statuses={statuses}
        onClear={clearFilters}
        hasActive={hasActiveFilters}
      />
      <p className="results-count" aria-live="polite">
        {hasActiveFilters
          ? `Showing ${filteredProjects.length} of ${projects.length} projects`
          : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
      </p>
      {filteredProjects.length > 0 ? (
        <div className="grid grid--projects">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
              onQuickView={(p) => setModalProject(p)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching projects"
          message="Nothing in the registry matches this combination of search and filters. Try broadening the search or clearing the filters."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
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

export default Projects;
