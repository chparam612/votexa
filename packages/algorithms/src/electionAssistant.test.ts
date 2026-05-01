import { 
  ConceptGraph, 
  LearningPathOptimizer, 
  BloomFilter, 
  StringSimilarity, 
  MinPriorityQueue,
  FiniteStateMachine,
  ElectionState,
  ElectionAction
} from './index';

describe('Votexa Election Assistant - Comprehensive Test Suite (55 Cases)', () => {
  
  // ──────────────────────────────────────────────────────────────────────────
  // 1. TOPOLOGICAL SORT (Concept Dependencies) - 10 Cases
  // ──────────────────────────────────────────────────────────────────────────
  describe('Topological Sort (ConceptGraph)', () => {
    let graph: ConceptGraph;
    beforeEach(() => { graph = new ConceptGraph(); });

    test('Case 1: Simple linear dependency A -> B -> C', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: [] });
      graph.addConcept({ id: 'B', title: 'B', prerequisites: ['A'] });
      graph.addConcept({ id: 'C', title: 'C', prerequisites: ['B'] });
      expect(graph.getLearningSequence()).toEqual(['A', 'B', 'C']);
    });

    test('Case 2: Multiple prerequisites', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: [] });
      graph.addConcept({ id: 'B', title: 'B', prerequisites: [] });
      graph.addConcept({ id: 'C', title: 'C', prerequisites: ['A', 'B'] });
      const order = graph.getLearningSequence();
      expect(order.indexOf('C')).toBeGreaterThan(order.indexOf('A'));
      expect(order.indexOf('C')).toBeGreaterThan(order.indexOf('B'));
    });

    test('Case 3: Circular dependency detection (Self)', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: ['A'] });
      expect(() => graph.getLearningSequence()).toThrow();
    });

    test('Case 4: Circular dependency detection (Chain)', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: ['C'] });
      graph.addConcept({ id: 'B', title: 'B', prerequisites: ['A'] });
      graph.addConcept({ id: 'C', title: 'C', prerequisites: ['B'] });
      expect(() => graph.getLearningSequence()).toThrow();
    });

    test('Case 5: Disconnected components', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: [] });
      graph.addConcept({ id: 'X', title: 'X', prerequisites: [] });
      const order = graph.getLearningSequence();
      expect(order).toContain('A');
      expect(order).toContain('X');
    });

    test('Case 6: Available concepts (empty start)', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: [] });
      graph.addConcept({ id: 'B', title: 'B', prerequisites: ['A'] });
      expect(graph.getAvailableConcepts([])).toEqual(['A']);
    });

    test('Case 7: Available concepts (midway)', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: [] });
      graph.addConcept({ id: 'B', title: 'B', prerequisites: ['A'] });
      expect(graph.getAvailableConcepts(['A'])).toEqual(['B']);
    });

    test('Case 8: Re-calculating sequence after new node', () => {
      graph.addConcept({ id: 'A', title: 'A', prerequisites: [] });
      expect(graph.getLearningSequence()).toEqual(['A']);
      graph.addConcept({ id: 'B', title: 'B', prerequisites: ['A'] });
      expect(graph.getLearningSequence()).toEqual(['A', 'B']);
    });

    test('Case 9: Deep chain (A->B->C->D->E)', () => {
      ['A', 'B', 'C', 'D', 'E'].forEach((id, i, arr) => {
        graph.addConcept({ id, title: id, prerequisites: i > 0 ? [arr[i-1]] : [] });
      });
      expect(graph.getLearningSequence()).toHaveLength(5);
    });

    test('Case 10: Empty graph', () => {
      expect(graph.getLearningSequence()).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. DIJKSTRA'S ALGORITHM (Optimal Paths) - 10 Cases
  // ──────────────────────────────────────────────────────────────────────────
  describe("Dijkstra's (LearningPathOptimizer)", () => {
    let optimizer: LearningPathOptimizer;
    beforeEach(() => { optimizer = new LearningPathOptimizer(); });

    test('Case 11: Shortest path direct vs indirect', () => {
      optimizer.addNode('A', [{ to: 'B', weight: 10 }, { to: 'C', weight: 2 }]);
      optimizer.addNode('C', [{ to: 'B', weight: 2 }]);
      optimizer.addNode('B', []);
      expect(optimizer.findOptimalPath('A', 'B')).toEqual(['A', 'C', 'B']);
    });

    test('Case 12: No path available', () => {
      optimizer.addNode('A', []);
      optimizer.addNode('B', []);
      expect(optimizer.findOptimalPath('A', 'B')).toEqual([]);
    });

    test('Case 13: Single node path', () => {
      optimizer.addNode('A', []);
      expect(optimizer.findOptimalPath('A', 'A')).toEqual(['A']);
    });

    test('Case 14: Tie-breaking weights', () => {
      optimizer.addNode('A', [{ to: 'B', weight: 5 }, { to: 'C', weight: 5 }]);
      optimizer.addNode('B', [{ to: 'D', weight: 1 }]);
      optimizer.addNode('C', [{ to: 'D', weight: 1 }]);
      optimizer.addNode('D', []);
      const path = optimizer.findOptimalPath('A', 'D');
      expect(path).toHaveLength(3);
      expect(path[0]).toBe('A');
      expect(path[2]).toBe('D');
    });

    test('Case 15: Large weights', () => {
      optimizer.addNode('A', [{ to: 'B', weight: 1000000 }]);
      optimizer.addNode('B', []);
      expect(optimizer.findOptimalPath('A', 'B')).toEqual(['A', 'B']);
    });

    test('Case 16: Zero weight edges', () => {
      optimizer.addNode('A', [{ to: 'B', weight: 0 }]);
      optimizer.addNode('B', []);
      expect(optimizer.findOptimalPath('A', 'B')).toEqual(['A', 'B']);
    });

    test('Case 17: Backwards path check', () => {
      optimizer.addNode('A', [{ to: 'B', weight: 1 }]);
      optimizer.addNode('B', []);
      expect(optimizer.findOptimalPath('B', 'A')).toEqual([]);
    });

    test('Case 18: Path through dense graph', () => {
      for(let i=0; i<5; i++) {
        optimizer.addNode(`n${i}`, [{ to: `n${i+1}`, weight: 1 }]);
      }
      optimizer.addNode('n5', []);
      expect(optimizer.findOptimalPath('n0', 'n5')).toHaveLength(6);
    });

    test('Case 19: Infinite distance handling', () => {
      optimizer.addNode('Start', [{ to: 'Mid', weight: 1 }]);
      optimizer.addNode('Goal', []);
      expect(optimizer.findOptimalPath('Start', 'Goal')).toEqual([]);
    });

    test('Case 20: Reusing nodes', () => {
      optimizer.addNode('A', [{ to: 'B', weight: 1 }]);
      optimizer.addNode('B', [{ to: 'C', weight: 1 }]);
      optimizer.addNode('C', []);
      expect(optimizer.findOptimalPath('A', 'C')).toEqual(['A', 'B', 'C']);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. BLOOM FILTER (Fast Lookup) - 10 Cases
  // ──────────────────────────────────────────────────────────────────────────
  describe('Bloom Filter', () => {
    let bf: BloomFilter;
    beforeEach(() => { bf = new BloomFilter(100, 3); });

    test('Case 21: Basic add and contain', () => {
      bf.add('voter_id');
      expect(bf.contains('voter_id')).toBe(true);
    });

    test('Case 22: Definitely not contains', () => {
      expect(bf.contains('not_here')).toBe(false);
    });

    test('Case 23: Multiple additions', () => {
      bf.add('A'); bf.add('B');
      expect(bf.contains('A')).toBe(true);
      expect(bf.contains('B')).toBe(true);
    });

    test('Case 24: False positive potential (not a failure, just documenting behavior)', () => {
      // Small filter, many entries
      const smallBf = new BloomFilter(10, 1);
      smallBf.add('item1');
      smallBf.add('item2');
      smallBf.add('item3');
      // Probabilistically it might return true for others, but must return true for these
      expect(smallBf.contains('item1')).toBe(true);
    });

    test('Case 25: Case sensitivity', () => {
      bf.add('Voter');
      expect(bf.contains('voter')).toBe(false);
    });

    test('Case 26: Large input strings', () => {
      const long = 'a'.repeat(1000);
      bf.add(long);
      expect(bf.contains(long)).toBe(true);
    });

    test('Case 27: Numeric strings', () => {
      bf.add('123');
      expect(bf.contains('123')).toBe(true);
    });

    test('Case 28: Special characters', () => {
      bf.add('!@#$%');
      expect(bf.contains('!@#$%')).toBe(true);
    });

    test('Case 29: Re-adding same item', () => {
      bf.add('test');
      bf.add('test');
      expect(bf.contains('test')).toBe(true);
    });

    test('Case 30: Empty string', () => {
      bf.add('');
      expect(bf.contains('')).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. LEVENSHTEIN DISTANCE (FAQ Matching) - 10 Cases
  // ──────────────────────────────────────────────────────────────────────────
  describe('Levenshtein (StringSimilarity)', () => {
    test('Case 31: Exact match score', () => {
      expect(StringSimilarity.score('Election', 'Election')).toBe(1.0);
    });

    test('Case 32: One character difference', () => {
      // Elect vs Elects (length 6) -> dist 1 -> score 1 - 1/6 = 0.833
      expect(StringSimilarity.score('Elect', 'Elects')).toBeCloseTo(0.83, 1);
    });

    test('Case 33: Case insensitive score', () => {
      expect(StringSimilarity.score('ELECTION', 'election')).toBe(1.0);
    });

    test('Case 34: Completely different strings', () => {
      expect(StringSimilarity.score('Apple', 'Zebra')).toBe(0.0);
    });

    test('Case 35: Empty string comparison', () => {
      expect(StringSimilarity.score('', '')).toBe(1.0);
      expect(StringSimilarity.score('A', '')).toBe(0.0);
    });

    test('Case 36: Transposition (Levenshtein = 2)', () => {
      // "te" vs "et" -> dist 2
      expect(StringSimilarity.levenshtein('te', 'et')).toBe(2);
    });

    test('Case 37: Subtraction/Deletion', () => {
      expect(StringSimilarity.levenshtein('Election', 'Elect')).toBe(3);
    });

    test('Case 38: Fuzzy matching threshold', () => {
      const match = StringSimilarity.score('Voter Registration', 'Voter Registratio');
      expect(match).toBeGreaterThan(0.9);
    });

    test('Case 39: Whitespace handling', () => {
      expect(StringSimilarity.score(' Word', 'Word ')).toBe(1.0);
    });

    test('Case 40: Multi-word strings', () => {
      const s1 = 'How do I register?';
      const s2 = 'How to register?';
      expect(StringSimilarity.score(s1, s2)).toBeGreaterThan(0.7);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. PRIORITY QUEUE (Content Sequencing) - 10 Cases
  // ──────────────────────────────────────────────────────────────────────────
  describe('Priority Queue (MinPriorityQueue)', () => {
    let pq: MinPriorityQueue<string>;
    beforeEach(() => { pq = new MinPriorityQueue<string>(); });

    test('Case 41: Basic extraction', () => {
      pq.insert(10, 'Low');
      pq.insert(1, 'High');
      expect(pq.extractMin()?.data).toBe('High');
    });

    test('Case 42: Multiple items same priority', () => {
      pq.insert(5, 'A');
      pq.insert(5, 'B');
      expect(pq.size).toBe(2);
    });

    test('Case 43: Extract from empty queue', () => {
      expect(pq.extractMin()).toBeNull();
    });

    test('Case 44: Peek behavior', () => {
      pq.insert(10, 'A');
      expect(pq.peek()?.data).toBe('A');
      expect(pq.size).toBe(1);
    });

    test('Case 45: Sorting order (Heapsort-like)', () => {
      pq.insert(3, '3');
      pq.insert(1, '1');
      pq.insert(2, '2');
      expect(pq.extractMin()?.priority).toBe(1);
      expect(pq.extractMin()?.priority).toBe(2);
      expect(pq.extractMin()?.priority).toBe(3);
    });

    test('Case 46: Size tracking', () => {
      expect(pq.size).toBe(0);
      pq.insert(1, 'A');
      expect(pq.size).toBe(1);
      pq.extractMin();
      expect(pq.size).toBe(0);
    });

    test('Case 47: Large number of items', () => {
      for(let i=100; i>0; i--) pq.insert(i, `${i}`);
      expect(pq.peek()?.priority).toBe(1);
      expect(pq.size).toBe(100);
    });

    test('Case 48: Negative priorities', () => {
      pq.insert(-1, 'Very Urgent');
      pq.insert(0, 'Urgent');
      expect(pq.extractMin()?.data).toBe('Very Urgent');
    });

    test('Case 49: Updating/Inverting logic', () => {
      // We often use (100 - actual_priority) for min-heaps acting as max-heaps
      pq.insert(100 - 80, 'Important');
      pq.insert(100 - 20, 'Casual');
      expect(pq.extractMin()?.data).toBe('Important');
    });

    test('Case 50: isEmpty check', () => {
      expect(pq.isEmpty()).toBe(true);
      pq.insert(1, 'A');
      expect(pq.isEmpty()).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. BUSINESS LOGIC (FSM & State) - 5 Cases
  // ──────────────────────────────────────────────────────────────────────────
  describe('FSM Logic', () => {
    test('Case 51: Valid transition SETUP -> REGISTRATION', () => {
      const fsm = new FiniteStateMachine(ElectionState.SETUP);
      expect(fsm.transition(ElectionAction.START_REGISTRATION)).toBe(true);
      expect(fsm.getState()).toBe(ElectionState.REGISTRATION_OPEN);
    });

    test('Case 52: Invalid transition SETUP -> FINALIZE', () => {
      const fsm = new FiniteStateMachine(ElectionState.SETUP);
      expect(fsm.transition(ElectionAction.FINALIZE)).toBe(false);
      expect(fsm.getState()).toBe(ElectionState.SETUP);
    });

    test('Case 53: PAUSE and RESUME flow', () => {
      const fsm = new FiniteStateMachine(ElectionState.VOTING_OPEN);
      fsm.transition(ElectionAction.PAUSE_VOTING);
      expect(fsm.getState()).toBe(ElectionState.VOTING_PAUSED);
      fsm.transition(ElectionAction.RESUME_VOTING);
      expect(fsm.getState()).toBe(ElectionState.VOTING_OPEN);
    });

    test('Case 54: Terminal state check', () => {
      const fsm = new FiniteStateMachine(ElectionState.CLOSED);
      expect(fsm.canTransition(ElectionAction.START_REGISTRATION)).toBe(false);
    });

    test('Case 55: Fast-track transition', () => {
      const fsm = new FiniteStateMachine(ElectionState.SETUP);
      fsm.transition(ElectionAction.START_VOTING);
      expect(fsm.getState()).toBe(ElectionState.VOTING_OPEN);
    });
  });
});
