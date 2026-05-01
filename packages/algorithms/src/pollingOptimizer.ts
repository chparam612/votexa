import { MinPriorityQueue } from './priorityQueue';

export interface PollingStation {
  id: string;
  name: string;
  currentWaitTimeMinutes: number;
  availableStaff: number;
  activeVoters: number;
}

export class PollingStationOptimizer {
  private waitTimeQueue: MinPriorityQueue<PollingStation>;

  constructor() {
    this.waitTimeQueue = new MinPriorityQueue<PollingStation>();
  }

  /**
   * Initializes the optimizer with a list of polling stations.
   */
  public initializeStations(stations: PollingStation[]): void {
    // Clear the existing queue (in a real app, we'd recreate it)
    this.waitTimeQueue = new MinPriorityQueue<PollingStation>();
    for (const station of stations) {
      this.addOrUpdateStation(station);
    }
  }

  /**
   * Adds or updates a station. Priority is the wait time (min-heap means fastest stations come out first).
   */
  public addOrUpdateStation(station: PollingStation): void {
    // The Priority Queue handles the ordering based on the priority value.
    // To recommend the FASTEST station, we use wait time as priority directly (lowest = best).
    this.waitTimeQueue.insert(station.currentWaitTimeMinutes, station);
  }

  /**
   * Get the polling station with the shortest wait time to recommend to a new voter.
   */
  public getBestStationForVoter(): PollingStation | null {
    const node = this.waitTimeQueue.peek();
    return node ? node.data : null;
  }

  /**
   * Calculate wait time based on simple heuristics.
   */
  public calculateWaitTime(activeVoters: number, availableStaff: number): number {
    if (availableStaff === 0) return 999; // Extremely high wait
    // Assume each staff member can process 1 voter per 5 minutes
    return Math.ceil(activeVoters / availableStaff) * 5;
  }
}
