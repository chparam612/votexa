import { MinPriorityQueue } from './priorityQueue';

describe('MinPriorityQueue', () => {
  let pq: MinPriorityQueue<string>;

  beforeEach(() => {
    pq = new MinPriorityQueue<string>();
  });

  test('initializes empty', () => {
    expect(pq.size).toBe(0);
    expect(pq.isEmpty()).toBe(true);
    expect(pq.peek()).toBeNull();
  });

  test('inserts and peeks correctly', () => {
    pq.insert(10, 'A');
    expect(pq.size).toBe(1);
    expect(pq.peek()?.data).toBe('A');
  });

  test('extracts minimum correctly', () => {
    pq.insert(5, 'A');
    pq.insert(1, 'B');
    pq.insert(10, 'C');
    
    expect(pq.extractMin()?.data).toBe('B');
    expect(pq.extractMin()?.data).toBe('A');
    expect(pq.extractMin()?.data).toBe('C');
    expect(pq.isEmpty()).toBe(true);
  });

  test('handles extraction with identical priorities', () => {
    pq.insert(5, 'A');
    pq.insert(5, 'B');
    
    const first = pq.extractMin()?.data;
    const second = pq.extractMin()?.data;
    
    expect(['A', 'B']).toContain(first);
    expect(['A', 'B']).toContain(second);
  });
});
