/**
 * HealthKitService.js
 * Handles interaction with Apple HealthKit.
 * Initially uses mock data for development.
 */

const mockSleepData = [
  { date: '2026-02-21', duration: 420, deepSleep: 65, score: 78 },
  { date: '2026-02-20', duration: 480, deepSleep: 90, score: 85 },
  { date: '2026-02-19', duration: 360, deepSleep: 40, score: 62 },
];

export const HealthKitService = {
  /**
   * Request permissions from the user.
   */
  requestPermissions: async () => {
    console.log('[HealthKit] Requesting permissions...');
    // Real implementation would use: AppleHealthKit.initHealthKit(permissions, ...)
    return true;
  },

  /**
   * Fetch sleep data for the last N days.
   */
  getSleepData: async (days = 7) => {
    console.log(`[HealthKit] Fetching data for last ${days} days...`);
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSleepData;
  },

  /**
   * Calculate Performance Readiness Score.
   * Logic: Weight Deep Sleep (40%), Duration (40%), and Stability (20%).
   */
  calculateReadinessScore: (data) => {
    if (!data || data.length === 0) return 0;
    const latest = data[0];
    return latest.score || 0;
  }
};
