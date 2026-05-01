import { MinPriorityQueue } from './priorityQueue';
import { ElectionState } from './fsm';
import { RiskLevel } from './riskScoring';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export enum NotificationType {
  CRITICAL_DEADLINE = 'CRITICAL_DEADLINE',
  REGISTRATION_REMINDER = 'REGISTRATION_REMINDER',
  VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED',
  POLLING_STATION_FOUND = 'POLLING_STATION_FOUND',
  GENERAL_INFO = 'GENERAL_INFO',
  EDUCATIONAL = 'EDUCATIONAL',
}

/** Priority weights per notification type (higher = more urgent) */
export const NOTIFICATION_BASE_PRIORITY: Record<NotificationType, number> = {
  [NotificationType.CRITICAL_DEADLINE]: 100,
  [NotificationType.REGISTRATION_REMINDER]: 80,
  [NotificationType.VERIFICATION_REQUIRED]: 75,
  [NotificationType.POLLING_STATION_FOUND]: 60,
  [NotificationType.GENERAL_INFO]: 40,
  [NotificationType.EDUCATIONAL]: 20,
};

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Hours until deadline — used to boost priority */
  hoursUntilDeadline?: number;
  scheduledAt: Date;
}

export interface ProcessedNotification extends ScheduledNotification {
  effectivePriority: number;
  processedAt: Date;
}

// ─────────────────────────────────────────────
// Notification Scheduler
// ─────────────────────────────────────────────

/**
 * Priority-based notification scheduler.
 *
 * Priority formula (from blueprint):
 *   effective_priority = (deadline_urgency × 0.6) + (type_base × 0.4)
 *
 * Where deadline_urgency is computed from hoursUntilDeadline:
 *   < 48h  → 100
 *   < 72h  → 75
 *   < 168h → 50
 *   else   → 25
 *
 * MinPriorityQueue naturally dequeues lowest priority number first,
 * so we invert: effectivePriority = 100 - computed score, giving
 * most urgent notifications the smallest heap key.
 */
export class NotificationScheduler {
  private queue: MinPriorityQueue<ScheduledNotification>;

  constructor() {
    this.queue = new MinPriorityQueue<ScheduledNotification>();
  }

  public get pendingCount(): number {
    return this.queue.size;
  }

  /** Schedule a notification — automatically computes effective priority */
  public schedule(notification: ScheduledNotification): void {
    const effectivePriority = this.computePriority(notification);
    // MinPriorityQueue extracts smallest first, so invert (100 - score)
    // to ensure highest urgency is extracted first.
    this.queue.insert(100 - effectivePriority, notification);
  }

  /** Process the next N most-urgent notifications */
  public processNextBatch(limit: number): ProcessedNotification[] {
    const results: ProcessedNotification[] = [];
    let count = 0;

    while (!this.queue.isEmpty() && count < limit) {
      const node = this.queue.extractMin();
      if (!node) break;

      const effectivePriority = 100 - node.priority; // un-invert
      results.push({
        ...node.data,
        effectivePriority,
        processedAt: new Date(),
      });
      count++;
    }

    return results;
  }

  /** Peek at the next most urgent notification without removing it */
  public peekNext(): ScheduledNotification | null {
    const node = this.queue.peek();
    return node ? node.data : null;
  }

  // ── Private Helpers ──────────────────────────────────────────────

  private computePriority(n: ScheduledNotification): number {
    const typeBase = NOTIFICATION_BASE_PRIORITY[n.type];
    const deadlineUrgency = this.getDeadlineUrgency(n.hoursUntilDeadline);

    // Weighted formula from blueprint
    return (deadlineUrgency * 0.6) + (typeBase * 0.4);
  }

  private getDeadlineUrgency(hours?: number): number {
    if (hours === undefined) return 25;
    if (hours < 48) return 100;
    if (hours < 72) return 75;
    if (hours < 168) return 50;
    return 25;
  }
}
