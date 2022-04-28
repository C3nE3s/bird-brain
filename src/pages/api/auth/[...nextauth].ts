import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../utils/prisma";

const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, NEXTAUTH_SECRET } =
  process.env;

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    TwitterProvider({
      clientId: TWITTER_CLIENT_ID as string,
      clientSecret: TWITTER_CLIENT_SECRET as string,
      version: "2.0",
    }),
  ],
  debug: true,
  secret: NEXTAUTH_SECRET as string,
});
