import type { User } from "next-auth";
import { prisma } from "utils/prisma";

/**
 * On sign in, create user if they dont exist
 * @param user
 */
export async function syncUser(user: User) {
  const { email, ...dbUser } = user;
  const upsertUser = await prisma.user.upsert({
    where: {
      id: user.id,
    },
    update: { ...dbUser },
    create: { ...dbUser },
  });
}
