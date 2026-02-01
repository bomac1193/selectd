import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function revokeCurator(email: string) {
  console.log(`Revoking curator access from: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User not found with email: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { isCurator: false },
  });

  console.log(`✓ Curator access revoked from ${user.name || user.email}`);
  await prisma.$disconnect();
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run curator:revoke <email>");
  process.exit(1);
}

revokeCurator(email).catch((error) => {
  console.error("Failed to revoke curator access:", error);
  process.exit(1);
});
