import axios from 'axios';

const BASE_URL = process.env.VOTEXA_API_URL || 'http://localhost:3000';
const CONCURRENT_USERS = 50;
const DURATION_MS = 10000; // 10 seconds

async function simulateVoter(id: number) {
  const userId = `load_test_user_${id}`;
  let successCount = 0;
  let errorCount = 0;

  const startTime = Date.now();
  while (Date.now() - startTime < DURATION_MS) {
    try {
      // 1. Fetch Dashboard (Cached)
      await axios.get(`${BASE_URL}/api/dashboard?userId=${userId}`);
      
      // 2. Fetch Risk Report (Cached)
      await axios.get(`${BASE_URL}/api/risk?userId=${userId}`);

      // 3. Occasionally transition (Busts cache)
      if (Math.random() > 0.8) {
        await axios.post(`${BASE_URL}/api/actions/transition`, {
          userId,
          action: 'VOTE_SUBMITTED'
        });
      }

      successCount++;
    } catch (error) {
      errorCount++;
    }
    // Small delay to prevent local socket exhaustion
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { successCount, errorCount };
}

async function runLoadTest() {
  console.log(`🚀 Starting Load Test with ${CONCURRENT_USERS} concurrent users for ${DURATION_MS/1000}s...`);
  
  const runners = Array.from({ length: CONCURRENT_USERS }).map((_, i) => simulateVoter(i));
  const results = await Promise.all(runners);

  const totalSuccess = results.reduce((acc, r) => acc + r.successCount, 0);
  const totalError = results.reduce((acc, r) => acc + r.errorCount, 0);
  const throughput = totalSuccess / (DURATION_MS / 1000);

  console.log('\n📊 --- LOAD TEST RESULTS ---');
  console.log(`Total Requests: ${totalSuccess + totalError}`);
  console.log(`Success: ${totalSuccess}`);
  console.log(`Errors: ${totalError}`);
  console.log(`Throughput: ${throughput.toFixed(2)} req/s`);
  console.log(`Success Rate: ${((totalSuccess / (totalSuccess + totalError)) * 100).toFixed(2)}%`);
}

runLoadTest().catch(console.error);
