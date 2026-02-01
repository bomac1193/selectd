import { PrismaClient } from "@prisma/client";
import { rm } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("Cleaning up test data...");

  // Delete all drops
  const dropsDeleted = await prisma.drop.deleteMany({});
  console.log(`Deleted ${dropsDeleted.count} drops`);

  // Delete all selections
  const selectionsDeleted = await prisma.selection.deleteMany({});
  console.log(`Deleted ${selectionsDeleted.count} selections`);

  // Delete all votes
  const votesDeleted = await prisma.vote.deleteMany({});
  console.log(`Deleted ${votesDeleted.count} votes`);

  // Delete uploaded files
  const uploadDir = path.join(process.cwd(), ".tmp", "uploads");
  try {
    await rm(uploadDir, { recursive: true, force: true });
    console.log("Deleted uploaded files");
  } catch (error) {
    console.log("No uploaded files to delete");
  }

  console.log("Cleanup complete!");
  await prisma.$disconnect();
}

cleanup().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
