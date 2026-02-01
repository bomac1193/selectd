import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCurators() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      isCurator: true,
    },
  });

  console.log("\nAll users:");
  users.forEach((user) => {
    console.log(`- ${user.email || user.name} - Curator: ${user.isCurator}`);
  });

  await prisma.$disconnect();
}

checkCurators().catch(console.error);
