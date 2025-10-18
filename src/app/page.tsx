'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Homepage from "./components/homepage";
import { fetchReposFromAPI } from "./services/apiService";

export default function Home() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      try {
        const data = await fetchReposFromAPI(page);
        setRepos(data);
      } catch (error) {
        console.error('Error fetching repos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [page]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-2 bg-white min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-2 bg-white min-h-screen">
      <Homepage page={page} repos={repos} />
    </div>
  );
}
