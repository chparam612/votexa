import { RecommendationEngine, UserContext } from './recommendation';
import { ElectionState } from './fsm';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;

  beforeEach(() => {
    engine = new RecommendationEngine();
  });

  test('should suggest content based on state', () => {
    const setupContent = engine.suggestEducationalContent(ElectionState.SETUP);
    expect(setupContent.length).toBeGreaterThan(0);
    expect(setupContent[0].title).toBe('Understanding Your Rights');

    const votingContent = engine.suggestEducationalContent(ElectionState.VOTING_OPEN);
    expect(votingContent[0].title).toBe('How to use EVM');
  });

  test('should tailor next block for beginners', () => {
    const context: UserContext = { state: ElectionState.VOTING_OPEN, experienceLevel: 'beginner' };
    const block = engine.getNextContentBlock(context);
    expect(block.title).toBe('Step-by-Step Guide');
    expect(block.actionLabel).toBe('Start Walkthrough');
  });

  test('should tailor next block for experienced users', () => {
    const context: UserContext = { state: ElectionState.VOTING_OPEN, experienceLevel: 'experienced' };
    const block = engine.getNextContentBlock(context);
    expect(block.title).toBe('Quick Actions');
    expect(block.actionLabel).toBe('Go to Tasks');
  });

  test('should match FAQ items', () => {
    const matches = engine.matchFAQ('Aadhar');
    expect(matches.length).toBe(1);
    expect(matches[0].title).toBe('ID Proof');
  });
});
