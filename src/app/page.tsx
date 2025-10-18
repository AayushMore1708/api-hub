import Image from "next/image";
import Link from "next/link";
import { getPopularRepos } from "./services/repoService";

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || "1", 10);

  const repos = await getPopularRepos(page);

  return (
    <div className="flex flex-col items-center justify-center py-2 bg-black min-h-screen">
      <p className="text-4xl">API Hub</p>
      <div>
        {page > 1 && <Link href={`/?page=${page - 1}`}>Previous</Link>}
        <Link href={`/?page=${page + 1}`}>Next</Link>
      </div>
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
    </div>
  );
}
