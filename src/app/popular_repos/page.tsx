import Link from "next/link";
import { getPopularRepos } from "../services/repoService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default async function PopularRepos({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || "1", 10);

  const repos = await getPopularRepos(page);
  <div>
    {page > 1 && <Link href={`/popular_repos?page=${page - 1}`}>Previous</Link>}
    <Link href={`/popular_repos?page=${page + 1}`}>Next</Link>
  </div>

  return (
    <ul>
      {repos.map((repo: { id: number; html_url: string; name: string; description: string; stargazers_count: number; language: string; owner: { login: string } }) => (
        <li key={repo.id}>
          <a href={repo.html_url}>{repo.name}</a>
          <p>{repo.description}</p>
          <span>⭐ {repo.stargazers_count}</span>
          <span>{repo.language}</span>
          <span>by {repo.owner.login}</span>
        </li>
      ))}
    </ul>

  );

}


