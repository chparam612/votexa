import * as functions from 'firebase-functions';
import { RiskScoringEngine, VoteMetadata } from '@votexa/algorithms';

const riskEngine = new RiskScoringEngine();

export const simulateRisk = functions.https.onCall((data, context) => {
  const { scenarios } = data; // Array of metadata
  if (!Array.isArray(scenarios)) {
    throw new functions.https.HttpsError('invalid-argument', 'scenarios must be an array of metadata objects.');
  }

  const results = scenarios.map((m: VoteMetadata) => {
    return {
      input: m,
      evaluation: riskEngine.evaluate(m)
    };
  });

  return { results };
});
