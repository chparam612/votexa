import { FiniteStateMachine, ElectionState, ElectionAction } from './fsm';

describe('FiniteStateMachine', () => {
  let fsm: FiniteStateMachine;

  beforeEach(() => {
    fsm = new FiniteStateMachine();
  });

  test('initializes in SETUP state by default', () => {
    expect(fsm.getState()).toBe(ElectionState.SETUP);
  });

  test('transitions successfully from SETUP to REGISTRATION_OPEN', () => {
    const success = fsm.transition(ElectionAction.START_REGISTRATION);
    expect(success).toBe(true);
    expect(fsm.getState()).toBe(ElectionState.REGISTRATION_OPEN);
  });

  test('fails to transition from SETUP to TALLYING', () => {
    const success = fsm.transition(ElectionAction.CLOSE_VOTING);
    expect(success).toBe(false);
    expect(fsm.getState()).toBe(ElectionState.SETUP);
  });

  test('follows a full valid election lifecycle', () => {
    expect(fsm.transition(ElectionAction.START_REGISTRATION)).toBe(true);
    expect(fsm.transition(ElectionAction.START_VOTING)).toBe(true);
    expect(fsm.transition(ElectionAction.PAUSE_VOTING)).toBe(true);
    expect(fsm.transition(ElectionAction.RESUME_VOTING)).toBe(true);
    expect(fsm.transition(ElectionAction.CLOSE_VOTING)).toBe(true);
    expect(fsm.transition(ElectionAction.FINALIZE)).toBe(true);
    expect(fsm.getState()).toBe(ElectionState.CLOSED);
  });

  test('canTransition correctly predicts valid actions', () => {
    expect(fsm.canTransition(ElectionAction.START_REGISTRATION)).toBe(true);
    expect(fsm.canTransition(ElectionAction.FINALIZE)).toBe(false);
  });
});
