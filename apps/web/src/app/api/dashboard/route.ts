import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { injectChaos } from '../admin/chaos/route';

// Mock DB call or external API
async function fetchDashboardData(userId: string) {
  // In reality, this would query Firestore
  return {
    userId,
    stats: {
      registeredVoters: 1250,
      votesCast: 450,
    },
    currentState: 'VOTING_OPEN',
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    await injectChaos();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const cacheKey = `dashboard:${userId}`;
    const data = await getCached(cacheKey, 60, () => fetchDashboardData(userId));

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message.includes('CHAOS_MONKEY')) {
      return NextResponse.json({ error: 'System Instability Detected' }, { status: 503 });
    }
    throw error;
  }
}
