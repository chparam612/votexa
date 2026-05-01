import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { NotificationScheduler, ScheduledNotification, NotificationType } from '@votexa/algorithms';

export const processNotifications = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();
  
  // 1. Fetch pending notifications from Firestore
  const pendingSnap = await db.collection('notifications')
    .where('status', '==', 'pending')
    .limit(100)
    .get();

  if (pendingSnap.empty) return { processed: 0, message: 'No pending notifications.' };

  const scheduler = new NotificationScheduler();
  
  // 2. Load into priority queue
  pendingSnap.forEach(doc => {
    const d = doc.data();
    scheduler.schedule({
      id: doc.id,
      userId: d.userId,
      type: d.type as NotificationType,
      title: d.title,
      body: d.body,
      hoursUntilDeadline: d.hoursUntilDeadline,
      scheduledAt: d.scheduledAt.toDate(),
    });
  });

  // 3. Process top 10 (or based on limit)
  const batchSize = data.limit || 10;
  const toProcess = scheduler.processNextBatch(batchSize);

  // 4. Update Firestore and simulate sending (FCM would be here)
  const batch = db.batch();
  for (const n of toProcess) {
    const ref = db.collection('notifications').doc(n.id);
    batch.update(ref, {
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      effectivePriority: n.effectivePriority
    });
  }

  await batch.commit();

  return {
    processed: toProcess.length,
    notifications: toProcess
  };
});
