import { ElectionState } from './fsm';

export interface ContentBlock {
  id: string;
  title: string;
  content: string;
  type: 'tutorial' | 'alert' | 'info' | 'faq';
  actionLabel?: string;
  actionUrl?: string;
}

export interface UserContext {
  state: ElectionState;
  experienceLevel: 'beginner' | 'experienced';
  region?: string;
}

export class RecommendationEngine {
  /**
   * Suggests educational content based on the user's current election state.
   */
  public suggestEducationalContent(state: ElectionState): ContentBlock[] {
    const recommendations: Record<ElectionState, ContentBlock[]> = {
      [ElectionState.SETUP]: [
        {
          id: 'edu-1',
          title: 'Understanding Your Rights',
          content: 'Learn about the constitutional rights of every voter.',
          type: 'tutorial',
        },
      ],
      [ElectionState.REGISTRATION_OPEN]: [
        {
          id: 'edu-2',
          title: 'Registration Checklist',
          content: 'Documents you need to register successfully.',
          type: 'info',
        },
      ],
      [ElectionState.VOTING_OPEN]: [
        {
          id: 'edu-3',
          title: 'How to use EVM',
          content: 'A quick guide on using Electronic Voting Machines.',
          type: 'tutorial',
        },
      ],
      [ElectionState.VOTING_PAUSED]: [
        {
          id: 'edu-4',
          title: 'Why is voting paused?',
          content: 'Understanding safety protocols during elections.',
          type: 'info',
        },
      ],
      [ElectionState.TALLYING]: [
        {
          id: 'edu-5',
          title: 'The Tallying Process',
          content: 'How votes are counted and verified.',
          type: 'info',
        },
      ],
      [ElectionState.CLOSED]: [
        {
          id: 'edu-6',
          title: 'Post-Election Analysis',
          content: 'What happens after the results are declared.',
          type: 'info',
        },
      ],
    };

    return recommendations[state] || [];
  }

  /**
   * Gets the next content block tailored to user's experience level.
   */
  public getNextContentBlock(context: UserContext): ContentBlock {
    if (context.experienceLevel === 'beginner') {
      return {
        id: 'next-beg',
        title: 'Step-by-Step Guide',
        content: `Since you are at the ${context.state} stage, let's walk through the details.`,
        type: 'tutorial',
        actionLabel: 'Start Walkthrough',
      };
    }

    return {
      id: 'next-exp',
      title: 'Quick Actions',
      content: `Jump straight to ${context.state} related tasks.`,
      type: 'info',
      actionLabel: 'Go to Tasks',
    };
  }

  /**
   * Simulates FAQ matching using a simple inclusion check (placeholder for more advanced algorithms like Levenshtein).
   */
  public matchFAQ(userQuestion: string): ContentBlock[] {
    const faqs: ContentBlock[] = [
      { id: 'f1', title: 'Registration', content: 'You can register online via the portal.', type: 'faq' },
      { id: 'f2', title: 'ID Proof', content: 'Aadhar card or Voter ID is usually sufficient.', type: 'faq' },
      { id: 'f3', title: 'Timing', content: 'Polling usually starts at 7:00 AM.', type: 'faq' },
    ];

    const query = userQuestion.toLowerCase();
    return faqs.filter(f => f.title.toLowerCase().includes(query) || f.content.toLowerCase().includes(query));
  }
}
