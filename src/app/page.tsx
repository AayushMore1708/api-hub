'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Homepage from "../components/ui/homepage";
import LoadingSpinner from "../components/ui/LoadingSpinner";
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
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (!session || lastPage === page) {
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
  }, [page, session, status, lastPage]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Homepage 
      page={page} 
      repos={repos} 
      isLoggedIn={!!session}
      userImage={session?.user?.image}
    />
  );
}