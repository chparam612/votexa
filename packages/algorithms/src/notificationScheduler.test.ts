import { NotificationScheduler, NotificationType } from './notificationScheduler';

describe('NotificationScheduler', () => {
  let scheduler: NotificationScheduler;

  beforeEach(() => {
    scheduler = new NotificationScheduler();
  });

  test('should prioritize CRITICAL_DEADLINE over EDUCATIONAL', () => {
    scheduler.schedule({
      id: '1',
      userId: 'u1',
      type: NotificationType.EDUCATIONAL,
      title: 'Learn more',
      body: '...',
      scheduledAt: new Date(),
    });

    scheduler.schedule({
      id: '2',
      userId: 'u2',
      type: NotificationType.CRITICAL_DEADLINE,
      title: 'Deadline!',
      body: '...',
      scheduledAt: new Date(),
    });

    const batch = scheduler.processNextBatch(2);
    expect(batch[0].type).toBe(NotificationType.CRITICAL_DEADLINE);
    expect(batch[1].type).toBe(NotificationType.EDUCATIONAL);
  });

  test('should boost priority based on deadline urgency', () => {
    // Both are same type, but one is closer to deadline
    scheduler.schedule({
      id: '1',
      userId: 'u1',
      type: NotificationType.GENERAL_INFO,
      title: 'Far',
      body: '...',
      hoursUntilDeadline: 200,
      scheduledAt: new Date(),
    });

    scheduler.schedule({
      id: '2',
      userId: 'u2',
      type: NotificationType.GENERAL_INFO,
      title: 'Near',
      body: '...',
      hoursUntilDeadline: 24,
      scheduledAt: new Date(),
    });

    const batch = scheduler.processNextBatch(2);
    expect(batch[0].title).toBe('Near');
    expect(batch[1].title).toBe('Far');
  });

  test('should handle weighted priority correctly', () => {
    // REGISTRATION_REMINDER (base 80) with 200h deadline (urgency 25)
    // Score = (25 * 0.6) + (80 * 0.4) = 15 + 32 = 47
    scheduler.schedule({
      id: '1',
      userId: 'u1',
      type: NotificationType.REGISTRATION_REMINDER,
      title: 'Reg',
      body: '...',
      hoursUntilDeadline: 200,
      scheduledAt: new Date(),
    });

    // POLLING_STATION_FOUND (base 60) with 24h deadline (urgency 100)
    // Score = (100 * 0.6) + (60 * 0.4) = 60 + 24 = 84
    scheduler.schedule({
      id: '2',
      userId: 'u2',
      type: NotificationType.POLLING_STATION_FOUND,
      title: 'Poll',
      body: '...',
      hoursUntilDeadline: 24,
      scheduledAt: new Date(),
    });

    const batch = scheduler.processNextBatch(2);
    expect(batch[0].title).toBe('Poll'); // 84 vs 47
    expect(batch[1].title).toBe('Reg');
  });
});
