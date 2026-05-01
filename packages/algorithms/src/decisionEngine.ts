import { ElectionAction, ElectionState } from './fsm';
import { RiskLevel } from './riskScoring';

export interface ActionItem {
  id: string;
  action: ElectionAction;
  priority: number;
  label: string;
}

export class DecisionEngine {
  /**
   * Generates a list of next possible actions based on the current state.
   */
  public getNextActions(state: ElectionState): ActionItem[] {
    const actionMap: Record<ElectionState, ActionItem[]> = {
      [ElectionState.SETUP]: [
        { id: 'a1', action: ElectionAction.START_REGISTRATION, priority: 1, label: 'Open Voter Registration' },
        { id: 'a2', action: ElectionAction.START_VOTING, priority: 2, label: 'Fast-track to Voting' },
      ],
      [ElectionState.REGISTRATION_OPEN]: [
        { id: 'a3', action: ElectionAction.START_VOTING, priority: 1, label: 'Close Registration & Start Voting' },
      ],
      [ElectionState.VOTING_OPEN]: [
        { id: 'a4', action: ElectionAction.PAUSE_VOTING, priority: 2, label: 'Pause Voting for Safety' },
        { id: 'a5', action: ElectionAction.CLOSE_VOTING, priority: 1, label: 'Close Polls & Start Tallying' },
      ],
      [ElectionState.VOTING_PAUSED]: [
        { id: 'a6', action: ElectionAction.RESUME_VOTING, priority: 1, label: 'Resume Voting' },
        { id: 'a7', action: ElectionAction.CLOSE_VOTING, priority: 2, label: 'Emergency Poll Closure' },
      ],
      [ElectionState.TALLYING]: [
        { id: 'a8', action: ElectionAction.FINALIZE, priority: 1, label: 'Finalize Results' },
      ],
      [ElectionState.CLOSED]: [],
    };

    return actionMap[state] || [];
  }

  /**
   * Re-prioritizes actions based on Risk Level.
   * If risk is high, safety and emergency actions are boosted to top priority.
   */
  public prioritizeActions(actions: ActionItem[], riskLevel: RiskLevel): ActionItem[] {
    return actions
      .map(item => {
        let priority = item.priority;
        if (riskLevel === RiskLevel.HIGH) {
          if (item.action === ElectionAction.PAUSE_VOTING || item.label.includes('Emergency')) {
            priority = 0; // Immediate attention
          }
        }
        return { ...item, priority };
      })
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generates a recommended path of steps based on experience level.
   */
  public generateRecommendedPath(state: ElectionState, level: 'beginner' | 'experienced'): string[] {
    const paths: Record<ElectionState, string[]> = {
      [ElectionState.SETUP]: ['Configure System', 'Verify Database', 'Start Registration'],
      [ElectionState.REGISTRATION_OPEN]: ['Promote App', 'Verify Voters', 'Close Registration'],
      [ElectionState.VOTING_OPEN]: ['Monitor Traffic', 'Audit Votes', 'Close Polls'],
      [ElectionState.VOTING_PAUSED]: ['Security Check', 'Restore System', 'Resume Voting'],
      [ElectionState.TALLYING]: ['Compute Totals', 'Cross-check', 'Finalize'],
      [ElectionState.CLOSED]: ['Archiving Data', 'Reporting'],
    };

    const basePath = paths[state] || [];
    return level === 'beginner' ? basePath : basePath.slice(-1);
  }
}
