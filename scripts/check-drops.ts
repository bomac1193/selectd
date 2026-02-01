import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { prisma } from "../src/lib/prisma";

async function checkDrops() {
  const drops = await prisma.drop.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  console.log("\nRecent drops:");
  drops.forEach((drop) => {
    console.log(`- ${drop.title} (${drop.status}) - ${drop.user.email} - ${drop.createdAt}`);
  });

  await prisma.$disconnect();
}

checkDrops().catch(console.error);
