import { RiskScoringEngine, RiskLevel, VoteMetadata } from './riskScoring';

describe('RiskScoringEngine', () => {
  let engine: RiskScoringEngine;

  beforeEach(() => {
    engine = new RiskScoringEngine();
  });

  const baseMetadata: VoteMetadata = {
    voterRegisteredRegion: 'CA',
    ipRegion: 'CA',
    deviceVoteCount: 1,
    failedAuthAttempts: 0,
    timeElapsedSinceRegistrationMs: 60000, // 1 minute
  };

  test('returns LOW risk for normal metadata', () => {
    const result = engine.evaluate(baseMetadata);
    expect(result.score).toBe(0);
    expect(result.level).toBe(RiskLevel.LOW);
    expect(result.flags).toHaveLength(0);
  });

  test('returns MEDIUM risk for geo mismatch', () => {
    const result = engine.evaluate({ ...baseMetadata, ipRegion: 'NY' });
    expect(result.score).toBe(30);
    expect(result.level).toBe(RiskLevel.MEDIUM);
    expect(result.flags).toContain('GEO_MISMATCH');
  });

  test('returns HIGH risk for multiple votes from same device', () => {
    const result = engine.evaluate({ ...baseMetadata, deviceVoteCount: 4 });
    // score = (4 - 1) * 25 = 75
    expect(result.score).toBe(75);
    expect(result.level).toBe(RiskLevel.HIGH);
    expect(result.flags).toContain('MULTIPLE_VOTES_FROM_DEVICE');
  });

  test('caps score at 100 for extremely suspicious activity', () => {
    const result = engine.evaluate({
      ...baseMetadata,
      ipRegion: 'RU', // geo mismatch (+30)
      deviceVoteCount: 10, // multiple devices (+225)
      failedAuthAttempts: 5, // auth struggles (+40 max)
      timeElapsedSinceRegistrationMs: 1000, // bot speed (+40)
    });
    expect(result.score).toBe(100);
    expect(result.level).toBe(RiskLevel.HIGH);
    expect(result.flags.length).toBe(4);
  });
});
