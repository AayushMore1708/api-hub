import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Repo {
  id: number;
  html_url: string;
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
  owner: { login: string };
}

interface HomepageProps {
  page: number;
  repos: Repo[];
}

export default function Homepage({ page, repos }: HomepageProps) {
  const displayedRepos = repos.slice(0, 9);

  return (
    <>
      <p className="text-4xl mb-6">API Hub</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-[70%]">
        {displayedRepos.map((repo) => (
          <Card key={repo.id} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle>
                <a href={repo.html_url} className="text-blue-600 hover:underline">{repo.name}</a>
              </CardTitle>
              <CardDescription>{repo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-gray-500">
                <span>⭐ {repo.stargazers_count}</span>
                <span>{repo.language}</span>
              </div>
              <p className="text-sm text-gray-500">by {repo.owner.login}</p>
            </CardContent>
          </Card>
          
        ))}
      </div>
      <div className="flex justify-center gap-4">
        {page > 1 && <Link href={`/?page=${page - 1}`} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Previous</Link>}
        <Link href={`/?page=${page + 1}`} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Next</Link>
      </div>
    </>
  );
}