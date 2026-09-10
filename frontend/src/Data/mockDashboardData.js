// src/Data/mockDashboardData.js
// Mock data for the dashboard. Replace with API calls later.

export const dashboardStats = [
  { label: "Total Projects",   value: 124, color: "#4a90d9" },
  { label: "Active Projects",  value: 87,  color: "#27ae60" },
  { label: "High Risk",        value: 18,  color: "#e74c3c" },
  { label: "Delayed Projects", value: 23,  color: "#f39c12" },
];

export const recentProjects = [
  {
    id: 1,
    name: "Mumbai-Pune Expressway Expansion",
    sector: "Highways",
    state: "Maharashtra",
    risk: "Low",
    progress: 72,
  },
  {
    id: 2,
    name: "Chennai Metro Phase 2",
    sector: "Urban Transit",
    state: "Tamil Nadu",
    risk: "Medium",
    progress: 45,
  },
  {
    id: 3,
    name: "Brahmaputra Bridge Project",
    sector: "Bridges",
    state: "Assam",
    risk: "High",
    progress: 28,
  },
];

export const riskOverview = [
  { level: "High",   count: 18, color: "#e74c3c" },
  { level: "Medium", count: 34, color: "#f39c12" },
  { level: "Low",    count: 72, color: "#27ae60" },
];

export const progressOverview = [
  { sector: "Highways",      progress: 72 },
  { sector: "Bridges",       progress: 58 },
  { sector: "Water Supply",  progress: 85 },
  { sector: "Urban Transit", progress: 41 },
];
