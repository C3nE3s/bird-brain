import NextAuth, { Account, User } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";

const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, NEXTAUTH_SECRET } =
  process.env;

const PKCE_SCOPES = [
  "tweet.read",
  "users.read",
  "bookmark.read",
  "bookmark.write",
  "offline.access",
];

interface RefreshTokenResponse {
  id_token: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
}

async function refreshAccessToken(user: User, newAccount: Account) {
  const now = new Date();

  try {
    // find user account if it exists
    const existingAccount = await prisma.account.findFirst({
      where: { id: user.id },
    });

    // token is still valid, do nothing
    if (
      existingAccount?.expires_at &&
      now.getSeconds() < existingAccount.expires_at
    ) {
      return;
    }

    const url =
      "https://api.twitter.com/2/oauth2/token?" +
      new URLSearchParams({
        client_id: TWITTER_CLIENT_ID as string,
        client_secret: TWITTER_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: existingAccount?.refresh_token as string,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedToken: RefreshTokenResponse = await response.json();

    if (!response.ok) {
      throw { refreshedToken };
    }

    await prisma.account.update({
      where: { id: existingAccount?.id },
      data: {
        refresh_token:
          refreshedToken.refresh_token ?? existingAccount?.refresh_token,
        access_token: refreshedToken.access_token,
        expires_at: now.getSeconds() + refreshedToken.expires_in * 1000,
      },
    });
  } catch (error) {
    console.error("Auth", error);
  }
}

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
      authorization: {
        params: { scope: PKCE_SCOPES.join(" ") },
      },
    }),
  ],
  debug: true,
  secret: NEXTAUTH_SECRET as string,
  events: {
    async signIn({ user, account }) {
      await refreshAccessToken(user, account);
    },
    async createUser({ user }) {
      //TODO: Call API route to populate w/ bookmarks for the first time
    },
  },
  callbacks: {
    async session({ session, user }) {
      session.user.userName = user.userName;
      return session;
    },
  },
});
