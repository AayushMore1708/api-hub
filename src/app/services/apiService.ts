export async function fetchReposFromAPI(page: number) {
  const response = await fetch(`/api/repos?page=${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
