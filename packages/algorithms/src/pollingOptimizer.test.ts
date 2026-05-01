import { PollingStationOptimizer, PollingStation } from './pollingOptimizer';

describe('PollingStationOptimizer', () => {
  let optimizer: PollingStationOptimizer;

  const stationA: PollingStation = {
    id: '1',
    name: 'Downtown Library',
    currentWaitTimeMinutes: 45,
    availableStaff: 5,
    activeVoters: 50,
  };

  const stationB: PollingStation = {
    id: '2',
    name: 'High School Gym',
    currentWaitTimeMinutes: 10,
    availableStaff: 10,
    activeVoters: 20,
  };

  const stationC: PollingStation = {
    id: '3',
    name: 'Community Center',
    currentWaitTimeMinutes: 120,
    availableStaff: 2,
    activeVoters: 60,
  };

  beforeEach(() => {
    optimizer = new PollingStationOptimizer();
  });

  test('calculates wait time correctly', () => {
    expect(optimizer.calculateWaitTime(50, 5)).toBe(50); // 50/5 = 10 * 5 = 50
    expect(optimizer.calculateWaitTime(20, 10)).toBe(10); // 20/10 = 2 * 5 = 10
    expect(optimizer.calculateWaitTime(10, 0)).toBe(999); // No staff
  });

  test('recommends the fastest station', () => {
    optimizer.initializeStations([stationA, stationB, stationC]);
    
    // Station B has 10 min wait, should be best
    const best = optimizer.getBestStationForVoter();
    expect(best?.name).toBe('High School Gym');
  });

  test('handles dynamic updates', () => {
    optimizer.initializeStations([stationA, stationB]);
    expect(optimizer.getBestStationForVoter()?.name).toBe('High School Gym');

    // What if a new ultra-fast station opens?
    const fastStation: PollingStation = {
      id: '4',
      name: 'Pop-up Tent',
      currentWaitTimeMinutes: 2,
      availableStaff: 2,
      activeVoters: 0,
    };

    optimizer.addOrUpdateStation(fastStation);
    expect(optimizer.getBestStationForVoter()?.name).toBe('Pop-up Tent');
  });
});
