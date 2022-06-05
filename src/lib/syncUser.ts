import type { User } from "next-auth";
import { prisma } from "utils/prisma";

/**
 * On sign in, create user if they dont exist
 * @param user
 */
export async function syncUser(user: User) {
  const { id, name, image, userName } = user;

  await prisma.user.upsert({
    where: {
      id: user.id,
    },
    update: {
      name: name,
      image: image,
      userName: userName,
    },
    create: {
      id: id,
      name: name,
      image: image,
      userName: userName,
    },
  });
}
