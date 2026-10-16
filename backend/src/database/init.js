import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log("🔄 Starting database initialization...");
    
    // Read the schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    // Execute the schema
    await client.query(schema);
    
    console.log("✅ Database schema created successfully!");
    console.log("✅ Sample data inserted!");
    console.log("\n📊 Database is ready for use.");
    console.log("\nSample users created:");
    console.log("  - tewodros@agriconnect.et (Farmer)");
    console.log("  - selam@agriconnect.et (Farmer)");
    console.log("  - kebede@agriconnect.et (Buyer)");
    console.log("\n🚀 You can now start the server with: npm run dev");
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
