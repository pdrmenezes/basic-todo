import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: any = null;

try {
  const connectionString = import.meta.env.DEV
    ? import.meta.env.VITE_DATABASE_URL
    : import.meta.env.DATABASE_URL;

  if (!connectionString) {
    console.warn(
      "DATABASE_URL environment variable is not set - database features will be disabled"
    );
  } else {
    console.log(`Connecting to production database`);
    db = drizzle(connectionString, { schema });
  }
} catch (error) {
  console.warn(
    "Database connection failed - database features will be disabled:",
    error
  );
}

export * from "./schema";
export * from "./services";
export * from "./transactions";
export * from "./utils";
export { db };
