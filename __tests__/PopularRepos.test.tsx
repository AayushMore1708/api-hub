import { getPopularRepos } from '../src/app/services/repoService';

describe('getPopularRepos', () => {
  it('should fetch popular repos', async () => {
    const repos = await getPopularRepos(1);
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.length).toBeGreaterThan(0);
  });
});
