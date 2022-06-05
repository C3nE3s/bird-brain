import type { User } from "next-auth";
import { prisma } from "utils/prisma";

//TODO: update user schema to save entire user object

/**
 * On sign in, create user if they dont exist
 * @param user
 */
export async function syncUser(user: User) {
  const upsertUser = await prisma.user.upsert({
    where: {
      id: user.id,
    },
    update: {},
    create: {
      id: user.id,
    },
  });
}
