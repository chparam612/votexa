export enum ElectionState {
  SETUP = 'SETUP',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  VOTING_OPEN = 'VOTING_OPEN',
  VOTING_PAUSED = 'VOTING_PAUSED',
  TALLYING = 'TALLYING',
  CLOSED = 'CLOSED',
}

export enum ElectionAction {
  START_REGISTRATION = 'START_REGISTRATION',
  START_VOTING = 'START_VOTING',
  PAUSE_VOTING = 'PAUSE_VOTING',
  RESUME_VOTING = 'RESUME_VOTING',
  CLOSE_VOTING = 'CLOSE_VOTING',
  FINALIZE = 'FINALIZE',
}

export class FiniteStateMachine {
  private currentState: ElectionState;

  // Define valid transitions: Record<CurrentState, Record<Action, NextState>>
  private transitions: Record<ElectionState, Partial<Record<ElectionAction, ElectionState>>> = {
    [ElectionState.SETUP]: {
      [ElectionAction.START_REGISTRATION]: ElectionState.REGISTRATION_OPEN,
      [ElectionAction.START_VOTING]: ElectionState.VOTING_OPEN, // Fast-track option
    },
    [ElectionState.REGISTRATION_OPEN]: {
      [ElectionAction.START_VOTING]: ElectionState.VOTING_OPEN,
    },
    [ElectionState.VOTING_OPEN]: {
      [ElectionAction.PAUSE_VOTING]: ElectionState.VOTING_PAUSED,
      [ElectionAction.CLOSE_VOTING]: ElectionState.TALLYING,
    },
    [ElectionState.VOTING_PAUSED]: {
      [ElectionAction.RESUME_VOTING]: ElectionState.VOTING_OPEN,
      [ElectionAction.CLOSE_VOTING]: ElectionState.TALLYING,
    },
    [ElectionState.TALLYING]: {
      [ElectionAction.FINALIZE]: ElectionState.CLOSED,
    },
    [ElectionState.CLOSED]: {}, // Terminal state
  };

  constructor(initialState: ElectionState = ElectionState.SETUP) {
    this.currentState = initialState;
  }

  public getState(): ElectionState {
    return this.currentState;
  }

  public canTransition(action: ElectionAction): boolean {
    const validActions = this.transitions[this.currentState];
    return validActions !== undefined && validActions[action] !== undefined;
  }

  public transition(action: ElectionAction): boolean {
    if (!this.canTransition(action)) {
      return false; // Transition failed
    }

    const nextState = this.transitions[this.currentState][action];
    if (nextState) {
      this.currentState = nextState;
      return true; // Transition successful
    }
    
    return false;
  }
}
