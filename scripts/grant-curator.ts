import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { prisma } from "../src/lib/prisma";

async function grantCurator(email: string) {
  console.log(`Granting curator access to: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User not found with email: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { isCurator: true },
  });

  console.log(`✓ Curator access granted to ${user.name || user.email}`);
  await prisma.$disconnect();
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run curator:grant <email>");
  process.exit(1);
}

grantCurator(email).catch((error) => {
  console.error("Failed to grant curator access:", error);
  process.exit(1);
});
