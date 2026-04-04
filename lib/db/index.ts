import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "dotenv";

config({ path: ".env.local" });


// Singleton connection for the application
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres connection (max 10 connections for serverless)
const client = postgres(connectionString, { max: 10 });

// Create drizzle instance with all schemas for relational queries
export const db = drizzle(client, { schema });
