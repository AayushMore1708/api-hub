export async function getPopularRepos(page: number) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=stars:>10000&sort=stars&order=desc&per_page=20&page=${page}`
  );
  const data = await response.json();
  return data.items;
} 