// src/pages/Projects.jsx
// Projects page with URL-synced filters, debounced search, and API refetch.
//
// KEY CONCEPTS:
// - useSearchParams: reads/writes URL query string (?search=mumbai&risk=High)
// - useDebounce: delays search filtering by 300ms so it doesn't fire every keystroke
// - useCallback: wraps handler functions so FilterBar (memo) doesn't re-render needlessly
// - useMemo: caches the sector/state lists so they're only recomputed when data changes

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import FilterBar from "../components/FilterBar";
import ProjectModal from "../components/ProjectModal";
import Loading from "../components/Loading";
import { getProjects } from "../services/api";
import useDebounce from "../hooks/useDebounce";

const BLUE = "#0B3D91";

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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px",
};

const emptyBoxStyle = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#6B7280",
};

function Projects() {
  // ===== URL QUERY STRING =====
  // useSearchParams reads and writes the URL's ?key=value pairs.
  // Example URL: /projects?search=mumbai&risk=High&sector=Highways
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values FROM the URL (or use defaults)
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");
  const [sectorFilter, setSectorFilter] = useState(searchParams.get("sector") || "All");
  const [stateFilter, setStateFilter] = useState(searchParams.get("state") || "All");
  const [riskFilter, setRiskFilter] = useState(searchParams.get("risk") || "All");

  // ===== DEBOUNCED SEARCH =====
  // The user's raw typing goes into searchText immediately (so the input feels responsive).
  // But the FILTERING only uses debouncedSearch, which updates 300ms after the user stops typing.
  const debouncedSearch = useDebounce(searchText, 300);

  // ===== DATA STATE =====
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalProject, setModalProject] = useState(null);

  const navigate = useNavigate();

  // ===== LOAD DATA ON PAGE OPEN =====
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ===== SYNC FILTERS TO URL =====
  // Whenever any filter changes, update the URL query string.
  // This makes filters shareable — copying the URL preserves the filters.
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (sectorFilter !== "All") params.sector = sectorFilter;
    if (stateFilter !== "All") params.state = stateFilter;
    if (riskFilter !== "All") params.risk = riskFilter;

    // { replace: true } prevents creating a browser history entry for every keystroke
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, sectorFilter, stateFilter, riskFilter, setSearchParams]);

  // ===== DYNAMIC DROPDOWN OPTIONS =====
  // useMemo: only recompute these arrays when `projects` changes (not on every render).
  const sectors = useMemo(
    () => [...new Set(projects.map((p) => p.sector))].sort(),
    [projects]
  );

  const statesList = useMemo(
    () => [...new Set(projects.map((p) => p.state))].sort(),
    [projects]
  );

  // ===== STABLE CALLBACK REFS =====
  // useCallback: wraps each handler so its identity stays the same across renders.
  // Without this, FilterBar (wrapped in memo) would re-render on every parent render
  // because it would receive a NEW function reference each time.
  const handleSearchChange = useCallback((val) => setSearchText(val), []);
  const handleSectorChange = useCallback((val) => setSectorFilter(val), []);
  const handleStateChange = useCallback((val) => setStateFilter(val), []);
  const handleRiskChange = useCallback((val) => setRiskFilter(val), []);

  // ===== FILTERING LOGIC =====
  // Uses debouncedSearch (not searchText) so filtering only happens after the delay.
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        project.sector.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        project.state.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesSector = sectorFilter === "All" || project.sector === sectorFilter;
      const matchesState = stateFilter === "All" || project.state === stateFilter;
      const matchesRisk = riskFilter === "All" || project.risk === riskFilter;
      return matchesSearch && matchesSector && matchesState && matchesRisk;
    });
  }, [projects, debouncedSearch, sectorFilter, stateFilter, riskFilter]);

  // ===== RENDER =====

  if (loading) {
    return (
      <div>
        <h1 style={{ margin: "0 0 4px", color: BLUE }}>Projects</h1>
        <p style={{ margin: "0 0 24px", color: "#6B7280" }}>Browse and filter infrastructure projects</p>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ margin: "0 0 4px", color: BLUE }}>Projects</h1>
        <p style={{ margin: "0 0 24px", color: "#6B7280" }}>Browse and filter infrastructure projects</p>
        <div style={errorBoxStyle}>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>⚠️ Failed to load projects</p>
          <p>{error}</p>
          <button onClick={loadProjects} style={retryButtonStyle}>Try Again</button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <h1 style={{ margin: "0 0 4px", color: BLUE }}>Projects</h1>
        <p style={{ margin: "0 0 24px", color: "#6B7280" }}>Browse and filter infrastructure projects</p>
        <div style={emptyBoxStyle}>
          <p style={{ fontSize: "48px", margin: "0" }}>📭</p>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>No projects yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 4px", color: BLUE }}>Projects</h1>
      <p style={{ margin: "0 0 24px", color: "#6B7280" }}>Browse and filter infrastructure projects</p>

      {/* FilterBar with debounced search + URL-synced selects */}
      <FilterBar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        sectorFilter={sectorFilter}
        onSectorChange={handleSectorChange}
        stateFilter={stateFilter}
        onStateChange={handleStateChange}
        riskFilter={riskFilter}
        onRiskChange={handleRiskChange}
        sectors={sectors}
        states={statesList}
      />

      {/* Results Count */}
      <p style={{ marginBottom: "16px", fontSize: "14px", color: "#9CA3AF" }}>
        Showing {filteredProjects.length} of {projects.length} projects
      </p>

      {/* Project Cards */}
      {filteredProjects.length > 0 ? (
        <div style={gridStyle}>
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
        <p style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
          No projects match your filters. Try changing the search or filters.
        </p>
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