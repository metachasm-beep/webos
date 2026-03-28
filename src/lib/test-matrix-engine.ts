import { calculateGrowthMetrics, calculateCompositeScore } from './matrix-engine';

async function testMatrixEngine() {
  console.log("--- Testing Matrix Engine ---");

  const urls = ["google.com", "turtlelabs.co", "github.com"];

  for (const url of urls) {
    console.log(`\nURL: ${url}`);
    const growth = calculateGrowthMetrics(url);
    console.log("Growth Metrics:", JSON.stringify(growth, null, 2));

    const techScores = {
      performance: 92,
      seo: 88,
      accessibility: 95,
      bestPractices: 85
    };

    const composite = calculateCompositeScore(growth, techScores);
    console.log("Composite Score:", JSON.stringify(composite, null, 2));

    // Verify consistency (deterministic simulation)
    const growth2 = calculateGrowthMetrics(url);
    if (JSON.stringify(growth) === JSON.stringify(growth2)) {
      console.log("✅ Consistency check passed (Deterministic)");
    } else {
      console.log("❌ Consistency check failed");
    }

    // Verify ranges
    if (growth.ltv_cac > 0 && growth.burn_multiple >= 0.5) {
      console.log("✅ Metric ranges valid");
    } else {
      console.log("❌ Metric ranges invalid");
    }
  }

  console.log("\n--- Verification Complete ---");
}

testMatrixEngine();
