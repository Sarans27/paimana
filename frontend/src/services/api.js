const API_URL = "http://localhost:5000/api";

export async function getProjects() {
  const response = await fetch(`${API_URL}/projects`);

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}