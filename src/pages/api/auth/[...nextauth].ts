import NextAuth, { User } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";

const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, NEXTAUTH_SECRET } =
  process.env;

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    TwitterProvider({
      clientId: TWITTER_CLIENT_ID as string,
      clientSecret: TWITTER_CLIENT_SECRET as string,
      version: "2.0",
      profile({ data }) {
        return {
          id: data.id,
          name: data.name,
          email: null,
          image: data.profile_image_url,
          userName: data.username,
        };
      },
    }),
  ],
  debug: true,
  secret: NEXTAUTH_SECRET as string,
  callbacks: {
    session: async ({ session, user }) => {
      type SessionUser = User & { userName: string };
      const { id, email, emailVerified, ...sessionUserProps } = user;
      session.user = sessionUserProps as SessionUser;
      return session;
    },
  },
});
