import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

async function fetchRiskReport(userId: string) {
  // Mock DB call
  return {
    userId,
    riskScore: 12,
    level: 'LOW',
    flags: [],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const cacheKey = `risk:${userId}`;
  const data = await getCached(cacheKey, 30, () => fetchRiskReport(userId));

  return NextResponse.json(data);
}
