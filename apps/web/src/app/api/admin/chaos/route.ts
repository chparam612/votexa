import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * CHAOS MONKEY API
 * Controls the reliability of the system for resilience testing.
 */
export async function POST(request: Request) {
  const { enabled, failureRate } = await request.json();

  await db.collection('election_metadata').doc('chaos_config').set({
    enabled: !!enabled,
    failureRate: failureRate || 0.1, // Default 10% failure
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    message: `Chaos Monkey ${enabled ? 'ENABLED' : 'DISABLED'}`,
    config: { enabled, failureRate }
  });
}

/**
 * Middleware-style check for chaos
 */
export async function injectChaos() {
  const configDoc = await db.collection('election_metadata').doc('chaos_config').get();
  const config = configDoc.data();

  if (config?.enabled && Math.random() < config.failureRate) {
    throw new Error('CHAOS_MONKEY_INJECTION: Synthetic failure for resilience testing.');
  }
}
