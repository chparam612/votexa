import { DecisionEngine } from './decisionEngine';
import { ElectionState, ElectionAction } from './fsm';
import { RiskLevel } from './riskScoring';

describe('DecisionEngine', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  test('should return next actions for a state', () => {
    const actions = engine.getNextActions(ElectionState.VOTING_OPEN);
    expect(actions.some(a => a.action === ElectionAction.CLOSE_VOTING)).toBe(true);
  });

  test('should prioritize safety actions when risk is HIGH', () => {
    const actions = engine.getNextActions(ElectionState.VOTING_OPEN);
    const prioritized = engine.prioritizeActions(actions, RiskLevel.HIGH);
    
    expect(prioritized[0].action).toBe(ElectionAction.PAUSE_VOTING);
    expect(prioritized[0].priority).toBe(0);
  });

  test('should keep normal priority when risk is LOW', () => {
    const actions = engine.getNextActions(ElectionState.VOTING_OPEN);
    const prioritized = engine.prioritizeActions(actions, RiskLevel.LOW);
    
    // CLOSE_VOTING (p1) should be before PAUSE_VOTING (p2)
    expect(prioritized[0].action).toBe(ElectionAction.CLOSE_VOTING);
  });

  test('should generate different paths based on experience', () => {
    const begPath = engine.generateRecommendedPath(ElectionState.SETUP, 'beginner');
    const expPath = engine.generateRecommendedPath(ElectionState.SETUP, 'experienced');
    
    expect(begPath.length).toBe(3);
    expect(expPath.length).toBe(1);
    expect(expPath[0]).toBe('Start Registration');
  });
});
