import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { RiskScoringEngine, VoteMetadata } from '@votexa/algorithms';

const riskEngine = new RiskScoringEngine();

export const getRiskReport = functions.https.onCall(async (data, context) => {
  const { voteId } = data;
  if (!voteId) throw new functions.https.HttpsError('invalid-argument', 'voteId is required.');

  const db = admin.firestore();
  const voteDoc = await db.collection('votes').doc(voteId).get();

  if (!voteDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Vote not found.');
  }

  const voteData = voteDoc.data()!;
  
  // If already analyzed, return cached result
  if (voteData.riskScore !== undefined) {
    return {
      score: voteData.riskScore,
      level: voteData.riskLevel,
      flags: voteData.flags,
      analyzedAt: voteData.analyzedAt,
    };
  }

  // Otherwise calculate (should ideally happen via trigger, but providing this as API)
  const metadata: VoteMetadata = {
    voterRegisteredRegion: voteData.voterRegisteredRegion || 'UNKNOWN',
    ipRegion: voteData.ipRegion || 'UNKNOWN',
    deviceVoteCount: voteData.deviceVoteCount || 1,
    failedAuthAttempts: voteData.failedAuthAttempts || 0,
    timeElapsedSinceRegistrationMs: voteData.timeElapsedSinceRegistrationMs || 60000,
  };

  const result = riskEngine.evaluate(metadata);
  return result;
});
