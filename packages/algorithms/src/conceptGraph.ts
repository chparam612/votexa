/**
 * Topological Sorting Algorithm for Concept Prerequisites.
 * Ensures learning flows from A -> B -> C without circular dependencies.
 */

export interface Concept {
  id: string;
  title: string;
  prerequisites: string[]; // IDs of other concepts
}

export class ConceptGraph {
  private adjacencyList: Map<string, string[]> = new Map();
  private concepts: Map<string, Concept> = new Map();

  public addConcept(concept: Concept): void {
    this.concepts.set(concept.id, concept);
    this.adjacencyList.set(concept.id, concept.prerequisites);
  }

  /**
   * Performs a topological sort to find a valid learning sequence.
   * Throws an error if a circular dependency is detected.
   */
  public getLearningSequence(): string[] {
    const visited: Set<string> = new Set();
    const temp: Set<string> = new Set();
    const order: string[] = [];

    const visit = (id: string) => {
      if (temp.has(id)) throw new Error(`Circular dependency detected at concept: ${id}`);
      if (visited.has(id)) return;

      temp.add(id);
      const prereqs = this.adjacencyList.get(id) || [];
      for (const prereqId of prereqs) {
        visit(prereqId);
      }
      temp.delete(id);
      visited.add(id);
      order.push(id);
    };

    for (const id of this.concepts.keys()) {
      visit(id);
    }

    return order;
  }

  /**
   * Returns all concepts that can be learned given a set of already learned IDs.
   */
  public getAvailableConcepts(learnedIds: string[]): string[] {
    const learnedSet = new Set(learnedIds);
    const available: string[] = [];

    for (const [id, concept] of this.concepts) {
      if (learnedSet.has(id)) continue;
      
      const canLearn = concept.prerequisites.every(p => learnedSet.has(p));
      if (canLearn) {
        available.push(id);
      }
    }

    return available;
  }
}
