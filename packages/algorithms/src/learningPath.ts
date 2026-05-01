import { MinPriorityQueue } from './priorityQueue';

/**
 * Dijkstra's Algorithm for Finding the Optimal Learning Path.
 * Weights can represent difficulty, time, or cognitive load.
 */

export interface LearningNode {
  id: string;
  edges: { to: string; weight: number }[];
}

export class LearningPathOptimizer {
  private nodes: Map<string, LearningNode> = new Map();

  public addNode(id: string, edges: { to: string; weight: number }[]): void {
    this.nodes.set(id, { id, edges });
  }

  /**
   * Finds the "shortest" path (least weight) between two concepts.
   */
  public findOptimalPath(startId: string, goalId: string): string[] {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const pq = new MinPriorityQueue<string>();

    // Initialize
    for (const id of this.nodes.keys()) {
      const initialDist = id === startId ? 0 : Infinity;
      distances.set(id, initialDist);
      previous.set(id, null);
      pq.insert(initialDist, id);
    }

    while (!pq.isEmpty()) {
      const current = pq.extractMin();
      if (!current || current.priority === Infinity) break;
      
      const u = current.data;
      if (u === goalId) break;

      const neighbors = this.nodes.get(u)?.edges || [];
      for (const edge of neighbors) {
        const alt = (distances.get(u) || 0) + edge.weight;
        if (alt < (distances.get(edge.to) || Infinity)) {
          distances.set(edge.to, alt);
          previous.set(edge.to, u);
          pq.insert(alt, edge.to);
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let curr: string | null = goalId;
    while (curr && distances.get(curr) !== Infinity) {
      path.push(curr);
      curr = previous.get(curr) || null;
    }

    return path.length > 0 && path[path.length - 1] === startId ? path.reverse() : [];
  }
}
