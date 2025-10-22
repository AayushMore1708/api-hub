'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Homepage from "./components/homepage";
import { fetchReposFromAPI } from "./services/apiService";
import { useSession } from 'next-auth/react';


export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPage, setLastPage] = useState<number | null>(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!session) {
      setLoading(false);
      return;
    }

    // Only fetch if page actually changed
    if (lastPage === page) {
      return;
    }

    const fetchRepos = async () => {
      setLoading(true);
      try {
        const data = await fetchReposFromAPI(page);
        setRepos(data);
        setLastPage(page);
      } catch (error) {
        console.error('Error fetching repos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [page, session, lastPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-2 bg-white min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
       <div className="flex flex-col items-center justify-center py-2 bg-white overflow-y-auto">
      <Homepage 
        page={page} 
        repos={repos} 
        isLoggedIn={!!session}
        userImage={session?.user?.image}
      />
    </div>
  );
}