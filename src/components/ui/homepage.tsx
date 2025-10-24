import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Typewriter } from "@/components/ui/typewriter-text"
import { useRouter } from "next/navigation";
import DotGrid from "./DotGrid";



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
  isLoggedIn: boolean;
  userImage?: string | null;
}

export default function Homepage({ page, repos, isLoggedIn, userImage }: HomepageProps) {
  const displayedRepos = repos.slice(0, 18);
  const router = useRouter();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <DotGrid
        className="z-0"
        baseColor="#7c3aed"
        activeColor="#a78bfa"
        dotSize={16}
        gap={32}
        proximity={150}
        style={{}}
      />
      <div className="relative z-10 flex flex-col items-center justify-center py-2 text-white">
        {isLoggedIn && (
          <Typewriter
            text={["API Hub"]}
            speed={100}
            loop={true}
            className="text-4xl font-medium"
          />

        )}
        {isLoggedIn && (
          <div className="flex flex-col justify-center">
            <p className="text-xl mt-10 mb-2 font-semibold text-white">Trending Repos </p>
            <button className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded mb-2 hover:from-purple-700 hover:to-violet-700 transition-all duration-200" onClick={() => router.push("/search")}>Search Api's
              <Typewriter
                text={["..."]}
                speed={100}
                loop={true}
                cursor=""
                className="text-xl font-small"
              />
            </button>
          </div>

        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 w-[90%]">
          {displayedRepos.map((repo) => (
            <Card key={repo.id} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 max-h-[20vh] overflow-y-auto scrollbar-hide ">
              <CardHeader>
                <CardTitle>
                  <a href={repo.html_url} className="text-blue-600 hover:underline ">{repo.name}</a>
                </CardTitle>
                <CardDescription className=" text-xs">{repo.description}</CardDescription>
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
          {isLoggedIn && <Link href={`/?page=${page + 1}`} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Next</Link>}
        </div>
      </div>
    </div>
  );
}