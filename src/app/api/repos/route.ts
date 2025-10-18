import { NextRequest, NextResponse } from 'next/server';
import { getPopularRepos } from '../../services/repoService';

export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);

  try {
    const repos = await getPopularRepos(page);
    return NextResponse.json(repos);
  } catch (error) {
    console.error('Error fetching repos:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}