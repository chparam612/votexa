import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { RiskScoringEngine, VoteMetadata } from "@votexa/algorithms";

// Initialize Admin SDK
admin.initializeApp();

// Export Handlers
export { getDashboard } from './handlers/dashboard';
export { transitionElectionState } from './handlers/transitions';
export { getRiskReport } from './handlers/risk';
export { getRecommendedPollingStation } from './handlers/polling';
export { processNotifications } from './handlers/notifications';
export { simulateRisk } from './handlers/simulate';

/**
 * Trigger: onCreate vote
 * Automatically evaluates risk when a vote is cast.
 */
const riskEngine = new RiskScoringEngine();

export const onVoteSubmitted = functions.firestore
  .document("votes/{voteId}")
  .onCreate(async (snap, context) => {
    const voteData = snap.data();
    functions.logger.info(`Analyzing new vote: ${context.params.voteId}`);

    const metadata: VoteMetadata = {
      voterRegisteredRegion: voteData.voterRegisteredRegion || "UNKNOWN",
      ipRegion: voteData.ipRegion || "UNKNOWN",
      deviceVoteCount: voteData.deviceVoteCount || 1,
      failedAuthAttempts: voteData.failedAuthAttempts || 0,
      timeElapsedSinceRegistrationMs: voteData.timeElapsedSinceRegistrationMs || 60000,
    };

    const riskResult = riskEngine.evaluate(metadata);
    
    functions.logger.info(`Risk Evaluation for ${context.params.voteId}: Score ${riskResult.score}, Level ${riskResult.level}`, { flags: riskResult.flags });

    return snap.ref.set({
      riskScore: riskResult.score,
      riskLevel: riskResult.level,
      flags: riskResult.flags,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
