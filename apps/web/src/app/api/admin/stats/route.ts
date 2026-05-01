import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin'; // Assume this is setup

export async function GET() {
  try {
    // 1. Fetch Aggregated Stats from Firestore
    // In a real production app, you might use a 'sharded counter' or 
    // a single 'metadata' doc for global tallies to avoid O(N) reads.
    const statsDoc = await db.collection('election_metadata').doc('global').get();
    const stats = statsDoc.data() || {
      totalVotes: 0,
      riskDistribution: { low: 0, medium: 0, high: 0 },
      currentStateCounts: {},
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
