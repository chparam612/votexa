export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface VoteMetadata {
  voterRegisteredRegion: string;
  ipRegion: string;
  deviceVoteCount: number; // How many votes have been cast from this device?
  failedAuthAttempts: number; // Failed logins prior to this vote
  timeElapsedSinceRegistrationMs?: number; // E.g., voting 2 seconds after registration is suspicious
}

export interface RiskResult {
  score: number; // 0 to 100
  level: RiskLevel;
  flags: string[]; // Reasons for the score
}

export class RiskScoringEngine {
  /**
   * Calculates a risk score for a given vote based on its metadata.
   */
  public evaluate(metadata: VoteMetadata): RiskResult {
    let score = 0;
    const flags: string[] = [];

    // 1. Geographic Anomaly
    if (metadata.ipRegion !== metadata.voterRegisteredRegion) {
      score += 30;
      flags.push('GEO_MISMATCH');
    }

    // 2. Velocity/Device Anomaly
    if (metadata.deviceVoteCount > 1) {
      // 1 vote is normal. More than 1 raises risk significantly.
      score += (metadata.deviceVoteCount - 1) * 25;
      flags.push('MULTIPLE_VOTES_FROM_DEVICE');
    }

    // 3. Authentication Struggles
    if (metadata.failedAuthAttempts > 0) {
      score += Math.min(metadata.failedAuthAttempts * 10, 40); // Cap at +40
      flags.push('HIGH_FAILED_AUTH_ATTEMPTS');
    }

    // 4. Fast Voting (Bot behavior)
    if (
      metadata.timeElapsedSinceRegistrationMs !== undefined &&
      metadata.timeElapsedSinceRegistrationMs < 5000 // Less than 5 seconds
    ) {
      score += 40;
      flags.push('SUSPICIOUS_SPEED');
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine Risk Level
    let level = RiskLevel.LOW;
    if (score >= 70) {
      level = RiskLevel.HIGH;
    } else if (score >= 30) {
      level = RiskLevel.MEDIUM;
    }

    return { score, level, flags };
  }
}
