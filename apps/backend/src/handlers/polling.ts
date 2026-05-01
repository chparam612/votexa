import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { PollingStationOptimizer, PollingStation } from '@votexa/algorithms';

export const getRecommendedPollingStation = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();
  
  // 1. Fetch all available polling stations
  const stationsSnap = await db.collection('polling_stations').get();
  const stations: PollingStation[] = stationsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PollingStation));

  if (stations.length === 0) {
    return { station: null, message: 'No polling stations available.' };
  }

  // 2. Use algorithm to find best one
  const optimizer = new PollingStationOptimizer();
  optimizer.initializeStations(stations);

  const bestStation = optimizer.getBestStationForVoter();

  return {
    recommendedStation: bestStation,
    allStations: stations.sort((a, b) => a.currentWaitTimeMinutes - b.currentWaitTimeMinutes)
  };
});
