/**
 * Matrix Engine
 * Orchestrates business growth metrics, weighted scoring, and analytical synthesis.
 * Inspired by: growth-engine, startup-metrics-framework, ai-analyzer, and seo-audit.
 */

export interface GrowthMetrics {
  ltv: number;
  cac: number;
  ltv_cac: number;
  burn_multiple: number;
  runway: number;
  k_factor: number;
  magic_number: number;
  retention_rate: number;
}

export interface CompositeScore {
  total: number;
  status: "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
  breakdown: {
    growth: number;
    efficiency: number;
    stability: number;
    technical: number;
  };
}

/**
 * Deterministically generates realistic startup KPIs based on a URL.
 * In a production env, this would fetch from a database or Stripe/Mixpanel API.
 */
export function calculateGrowthMetrics(url: string): GrowthMetrics {
  // Use a simple hash of the URL to keep metrics consistent for the same site
  const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const seed = (n: number, min: number, max: number) => {
    const val = (hash * n) % 1000 / 1000;
    return min + val * (max - min);
  };

  const ltv = seed(7, 500, 5000);
  const cac = seed(13, 100, 1500);
  const ltv_cac = ltv / cac;
  
  // Simulated burn and runway
  const burn_multiple = seed(17, 0.5, 3.0);
  const runway = Math.floor(seed(19, 6, 24));
  
  // Viral coefficient (K-factor)
  const k_factor = seed(23, 0.1, 1.5);
  
  // Magic number (SaaS Efficiency)
  const magic_number = seed(29, 0.3, 1.2);
  
  // Logo retention
  const retention_rate = seed(31, 60, 100);

  return {
    ltv: Math.round(ltv),
    cac: Math.round(cac),
    ltv_cac: Number(ltv_cac.toFixed(2)),
    burn_multiple: Number(burn_multiple.toFixed(2)),
    runway,
    k_factor: Number(k_factor.toFixed(2)),
    magic_number: Number(magic_number.toFixed(2)),
    retention_rate: Math.round(retention_rate),
  };
}

/**
 * Implements the Weighted Composite Model from the seo-audit skill.
 * Weight Distribution:
 * - Efficiency (LTV:CAC, Payback): 30%
 * - Stability (Burn, Runway): 25%
 * - Growth (K-factor, Retention): 30%
 * - Technical (Perf, SEO, A11y): 15%
 */
export function calculateCompositeScore(
  growthMetrics: GrowthMetrics,
  techMetrics: { performance: number; seo: number; accessibility: number; bestPractices: number }
): CompositeScore {
  
  // 1. Efficiency Score (0-100)
  let effBase = 100;
  if (growthMetrics.ltv_cac < 1) effBase -= 30;
  else if (growthMetrics.ltv_cac < 3) effBase -= 15;
  if (growthMetrics.magic_number < 0.5) effBase -= 10;
  const efficiency = Math.max(0, effBase);

  // 2. Stability Score (0-100)
  let stabBase = 100;
  if (growthMetrics.runway < 12) stabBase -= 20;
  if (growthMetrics.burn_multiple > 2) stabBase -= 20;
  const stability = Math.max(0, stabBase);

  // 3. Growth Score (0-100)
  let growthBase = 100;
  if (growthMetrics.k_factor < 0.5) growthBase -= 15;
  if (growthMetrics.retention_rate < 85) growthBase -= 15;
  const growth = Math.max(0, growthBase);

  // 4. Technical Score (Average of 4 audit categories)
  const technical = (techMetrics.performance + techMetrics.seo + techMetrics.accessibility + techMetrics.bestPractices) / 4;

  // Final Weighted Calculation
  const total = Math.round(
    efficiency * 0.30 +
    stability * 0.25 +
    growth * 0.30 +
    technical * 0.15
  );

  let status: CompositeScore["status"] = "Fair";
  if (total >= 90) status = "Excellent";
  else if (total >= 75) status = "Good";
  else if (total >= 60) status = "Fair";
  else if (total >= 40) status = "Poor";
  else status = "Critical";

  return {
    total,
    status,
    breakdown: {
      efficiency,
      stability,
      growth,
      technical
    }
  };
}

/**
 * Simple Z-score anomaly detection inspired by ai-analyzer.
 * Returns true if the score deviates significantly.
 */
export function detectAnomaly(current: number, history: number[]): boolean {
  if (history.length < 3) return false;
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const stdDev = Math.sqrt(history.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / history.length);
  const zScore = (current - mean) / (stdDev || 1);
  return Math.abs(zScore) > 2.0;
}
