import * as admin from 'firebase-admin';
import { ElectionState, NotificationType } from '../src/handlers/../../packages/algorithms/src'; 
// Note: Path depends on how this is run. If using ts-node, relative to script.

// Initialize for local use (use your service account if running locally)
// admin.initializeApp({ ... }); 
// For this environment, we assume admin is already configured or we're using emulators.

const db = admin.firestore();

async function seed() {
  console.log('🌱 Seeding Votexa data...');

  // 1. Election Metadata
  await db.collection('election_metadata').doc('global').set({
    currentState: 'SETUP',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    electionName: 'General Elections 2026',
  });

  // 2. Polling Stations
  const stations = [
    { name: 'Shantinagar School', currentWaitTimeMinutes: 5, activeVoters: 10, availableStaff: 2 },
    { name: 'Basavangudi Center', currentWaitTimeMinutes: 15, activeVoters: 45, availableStaff: 3 },
    { name: 'Indiranagar Library', currentWaitTimeMinutes: 2, activeVoters: 4, availableStaff: 2 },
    { name: 'Jayanagar Stadium', currentWaitTimeMinutes: 45, activeVoters: 200, availableStaff: 5 },
  ];

  for (const s of stations) {
    await db.collection('polling_stations').add(s);
  }

  // 3. Notifications
  const notifications = [
    { 
      userId: 'user_1', 
      type: 'CRITICAL_DEADLINE', 
      title: 'Registration Closing Soon!', 
      body: 'You have 48 hours to complete your registration.',
      hoursUntilDeadline: 48,
      status: 'pending',
      scheduledAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { 
      userId: 'user_2', 
      type: 'EDUCATIONAL', 
      title: 'How to Vote', 
      body: 'Check out our latest tutorial on voting.',
      status: 'pending',
      scheduledAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  for (const n of notifications) {
    await db.collection('notifications').add(n);
  }

  console.log('✅ Seeding complete.');
}

// Check if running directly
if (require.main === module) {
  seed().catch(console.error);
}

export { seed };
