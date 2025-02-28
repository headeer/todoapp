// Script to add the plannedDate column to the Task table
require("dotenv").config();
const { Pool } = require("pg");

// Create a connection pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  console.log("Connecting to database...");

  try {
    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Task' AND column_name = 'plannedDate'
    `);

    if (checkResult.rows.length > 0) {
      console.log("The plannedDate column already exists in the Task table.");
      return;
    }

    // Add the plannedDate column
    console.log("Adding plannedDate column to Task table...");
    await pool.query(`
      ALTER TABLE "Task" ADD COLUMN "plannedDate" TIMESTAMP;
    `);

    console.log("Successfully added plannedDate column to Task table!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
