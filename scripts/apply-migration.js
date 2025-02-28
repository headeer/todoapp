// Script to apply the plannedDate migration to the production database
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration to add plannedDate column...");

  try {
    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "../prisma/migrations/add_planned_date.sql"),
      "utf8"
    );

    // Execute the SQL directly
    await prisma.$executeRawUnsafe(migrationSQL);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error applying migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
