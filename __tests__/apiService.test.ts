describe('fetchReposFromAPI - API Tests', () => {
  const baseURL = 'http://localhost:3000';

  it('should fetch repos successfully from API', async () => {
    const response = await fetch(`${baseURL}/api/repos?page=1`);
    expect(response.ok).toBe(true);
    
    const repos = await response.json();
    
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.length).toBeGreaterThan(0);
  });

  it('should return repos with high star counts', async () => {
    const response = await fetch(`${baseURL}/api/repos?page=1`);
    const repos = await response.json();
    
    // All repos should have more than 10000 stars based on the query
    repos.forEach((repo: any) => {
      expect(repo.stargazers_count).toBeGreaterThan(10000);
    });
  });
});
