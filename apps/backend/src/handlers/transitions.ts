import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FiniteStateMachine, ElectionAction, ElectionState } from '@votexa/algorithms';

export const transitionElectionState = functions.https.onCall(async (data, context) => {
  // In production, check for ADMIN role
  // if (context.auth?.token.role !== 'admin') throw new functions.https.HttpsError('permission-denied', 'Only admins can change election state.');

  const { action } = data;
  if (!action) throw new functions.https.HttpsError('invalid-argument', 'Action is required.');

  const db = admin.firestore();
  const electionRef = db.collection('election_metadata').doc('global');

  // Transaction to ensure atomicity
  return db.runTransaction(async (transaction) => {
    const electionDoc = await transaction.get(electionRef);
    const currentState = (electionDoc.data()?.currentState as ElectionState) || ElectionState.SETUP;

    const fsm = new FiniteStateMachine(currentState);
    
    if (!fsm.canTransition(action as ElectionAction)) {
      throw new functions.https.HttpsError('failed-precondition', `Invalid action ${action} for current state ${currentState}`);
    }

    fsm.transition(action as ElectionAction);
    const nextState = fsm.getState();

    transaction.set(electionRef, {
      currentState: nextState,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastAction: action,
      updatedBy: context.auth?.uid || 'system',
    }, { merge: true });

    return {
      success: true,
      previousState: currentState,
      newState: nextState
    };
  });
});
