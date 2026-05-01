import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FiniteStateMachine, ElectionState } from '@votexa/algorithms';

export const getDashboard = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated if needed
  // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

  const db = admin.firestore();
  
  // 1. Get global election metadata (for current state)
  const electionDoc = await db.collection('election_metadata').doc('global').get();
  const currentState = (electionDoc.data()?.currentState as ElectionState) || ElectionState.SETUP;

  // 2. Get some stats
  const usersCount = (await db.collection('users').count().get()).data().count;
  const votesCount = (await db.collection('votes').count().get()).data().count;

  return {
    currentState,
    stats: {
      registeredVoters: usersCount,
      votesCast: votesCount,
    },
    serverTime: new Date().toISOString(),
  };
});
