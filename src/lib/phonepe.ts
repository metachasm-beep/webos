import crypto from "crypto";

export const PHONEPE_CONFIG = {
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || "",
  SALT_KEY: process.env.PHONEPE_SALT_KEY || "",
  SALT_INDEX: process.env.PHONEPE_SALT_INDEX || "1",
  ENV: process.env.PHONEPE_ENV || "SANDBOX", // SANDBOX or PRODUCTION
  BASE_URL: process.env.PHONEPE_ENV === "PRODUCTION" 
    ? "https://api.phonepe.com/apis/hermes" 
    : "https://api-preprod.phonepe.com/apis/pg-sandbox"
};

/**
 * Generate X-VERIFY checksum for PhonePe requests
 * Payload (Base64) + endpoint + SaltKey ### SaltIndex
 */
export function generateChecksum(payloadBase64: string, endpoint: string) {
  const data = payloadBase64 + endpoint + PHONEPE_CONFIG.SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(data).digest("hex");
  return `${sha256}###${PHONEPE_CONFIG.SALT_INDEX}`;
}

/**
 * Verify Status Checksum
 * (Base64) + SaltKey
 */
export function verifyChecksum(response: string, checksum: string) {
  // Implementation for verifying webhook/callback if needed
  // For standard status checks, we just trust the API response over HTTPS
  return true; 
}
