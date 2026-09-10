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
import { RISK_BANDS } from "../utils/risk";
import {
  calculateProjectStats,
  recentByStartDate,
  sectorProgress,
} from "../utils/stats";

// ===== CONFIGURATION =====

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Set to false when your backend is ready
const USE_MOCK = true;

// Simulates network delay (in milliseconds) so skeleton states remain
// perceptible without punishing every navigation. Kept short on purpose:
// perceived speed matters more than simulating a slow network.
const MOCK_DELAY = 350;

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
    // Derived from the same project array every other view uses —
    // never a parallel hardcoded stat block.
    const s = calculateProjectStats(allProjects);
    return simulateDelay({
      stats: [
        { label: "Total Projects", value: s.total, color: "var(--gov-blue)" },
        { label: "Active Projects", value: s.active, color: "var(--success)" },
        { label: "High Risk", value: s.highRisk, color: "var(--danger)" },
        { label: "Delayed Projects", value: s.delayed, color: "var(--warning)" },
      ],
      recentProjects: recentByStartDate(allProjects, 3),
      riskOverview: RISK_BANDS.map((band) => ({
        level: band.level,
        count: s.byBand[band.level] || 0,
        color: band.color,
      })),
      progressOverview: sectorProgress(allProjects),
    });
  }
  return fetchFromAPI("/dashboard");
}

/**
 * POST /auth/login
 * Authenticates a user. In mock mode this accepts any non-empty
 * credentials (demonstration only) and never stores anything.
 * The real backend expects { username, password } and returns a JWT,
 * which callers must keep out of rendered output and storage decisions
 * belong to the future auth layer — not to this module.
 */
export async function login({ email, password }) {
  if (USE_MOCK) {
    if (!email || !password) {
      throw new Error("Credentials required");
    }
    await simulateDelay({ ok: true });
    return { ok: true, role: "admin" };
  }
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}