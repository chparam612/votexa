import { NextResponse } from 'next/server';
import { invalidateUserCache } from '@/lib/cache';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
  }

  // 1. Perform FSM Transition in DB
  console.log(`Processing transition ${action} for user ${userId}`);
  
  // 2. Invalidate cache to ensure subsequent dashboard calls fetch fresh data
  await invalidateUserCache(userId);

  return NextResponse.json({
    success: true,
    newState: 'VOTING_PAUSED', // Mock
    invalidated: true,
  });
}
