import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

async function fetchPollingStations(district: string) {
  // Mock DB call
  return [
    { id: '1', name: 'District School', waitTime: 5 },
    { id: '2', name: 'Community Center', waitTime: 20 },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') || 'default';

  const cacheKey = `polling_stations:${district}`;
  const data = await getCached(cacheKey, 300, () => fetchPollingStations(district));

  return NextResponse.json(data);
}
