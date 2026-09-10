// src/services/api.js
//
// API SERVICE LAYER
// =================
// This file is the SINGLE PLACE where the frontend talks to the backend.
//
// CURRENT MODE: MOCK DATA
// The backend doesn't exist yet, so we SIMULATE API calls using mock data.
// When the backend is ready, set USE_MOCK = false (or remove the mock code).
//
// This lets you test loading, success, error, and empty states RIGHT NOW
// without needing a running backend server.

import allProjects from "../Data/mockProjectsData";
import {
  dashboardStats,
  recentProjects,
  riskOverview,
  progressOverview,
} from "../Data/mockDashboardData";

// ===== CONFIGURATION =====

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Set to false when your backend is ready
const USE_MOCK = true;

// Simulates network delay (in milliseconds) so you can see the loading state
const MOCK_DELAY = 800;

// ===== MOCK HELPERS =====

// This function pretends to be a slow network request.
// It waits MOCK_DELAY ms, then returns the mock data.
function simulateDelay(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
}

// ===== REAL API HELPER =====

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// ===== PUBLIC API FUNCTIONS =====
// Each function uses mock data for now, but will switch to the real API
// when USE_MOCK is set to false.

/**
 * GET /projects
 * Fetches the list of all projects.
 */
export async function getProjects() {
  if (USE_MOCK) {
    return simulateDelay(allProjects);
  }
  return fetchFromAPI("/projects");
}

/**
 * GET /projects/:id
 * Fetches details for a single project.
 */
export async function getProjectById(id) {
  if (USE_MOCK) {
    const project = allProjects.find((p) => p.id === Number(id));
    if (!project) {
      // Simulate a "not found" error, just like a real 404 would
      throw new Error("Project not found");
    }
    return simulateDelay(project);
  }
  return fetchFromAPI(`/projects/${id}`);
}

/**
 * GET /dashboard
 * Fetches dashboard summary data.
 */
export async function getDashboard() {
  if (USE_MOCK) {
    return simulateDelay({
      stats: dashboardStats,
      recentProjects: recentProjects,
      riskOverview: riskOverview,
      progressOverview: progressOverview,
    });
  }
  return fetchFromAPI("/dashboard");
}

/**
 * GET /projects/:id/risk
 * Fetches risk analysis data for a specific project.
 */
export async function getProjectRisk(id) {
  if (USE_MOCK) {
    const project = allProjects.find((p) => p.id === Number(id));
    if (!project) {
      throw new Error("Project not found");
    }
    return simulateDelay({ risk: project.risk, progress: project.progress });
  }
  return fetchFromAPI(`/projects/${id}/risk`);
}