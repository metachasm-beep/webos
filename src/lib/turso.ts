import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  if (process.env.NODE_ENV === "production") {
    console.error("CRITICAL: Turso Neural Registry Credentials Missing in Production.");
  } else {
    console.warn("Turso Neural Registry Offline (Missing Credentials). Persistence is disabled.");
  }
}

export const turso = createClient({
  url: url || "libsql://placeholder.turso.io",
  authToken: authToken || "placeholder",
});
