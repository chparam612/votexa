import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'votexa-ac15c',
    databaseURL: 'https://votexa-ac15c.firebaseio.com',
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
