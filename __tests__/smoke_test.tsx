import { getPopularRepos } from '../src/app/services/repoService';

describe('API Smoke Test', () => {
  it('should successfully fetch popular repositories from GitHub API', async () => {
    const repos = await getPopularRepos(1);
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.length).toBeGreaterThan(0);
    expect(repos[0]).toHaveProperty('id');
    expect(repos[0]).toHaveProperty('name');
    expect(repos[0]).toHaveProperty('html_url');
    expect(repos[0]).toHaveProperty('description');
    expect(repos[0]).toHaveProperty('stargazers_count');
    expect(repos[0]).toHaveProperty('language');
    expect(repos[0]).toHaveProperty('owner');
  });
});
