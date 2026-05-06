import postgres from "postgres";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config({ path: ".env.local" });

async function migrate() {
    const sql = postgres(process.env.DATABASE_URL!);
    
    try {
        const migrationPath = path.join(process.cwd(), "lib/db/migrations/0001_mature_snowbird.sql");
        const query = fs.readFileSync(migrationPath, "utf-8");
        
        console.log("Running migration...");
        await sql.unsafe(query);
        console.log("Migration successful!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await sql.end();
    }
}

migrate();
