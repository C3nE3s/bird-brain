import { refreshToken } from "lib/refreshToken";
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt/types";
import TwitterProvider from "next-auth/providers/twitter";

const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, NEXTAUTH_SECRET } =
  process.env;

const PKCE_SCOPES = [
  "tweet.read",
  "users.read",
  "bookmark.read",
  "bookmark.write",
  "offline.access",
];

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: TWITTER_CLIENT_ID as string,
      clientSecret: TWITTER_CLIENT_SECRET as string,
      version: "2.0",
      profile({ data }) {
        return {
          id: data.id,
          name: data.name,
          image: data.profile_image_url,
          userName: data.username,
        };
      },
      authorization: {
        params: { scope: PKCE_SCOPES.join(" ") },
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  secret: NEXTAUTH_SECRET as string,
  callbacks: {
    async jwt({ user, token, account }): Promise<JWT> {
      const now = Date.now();
      // Initial sign in
      if (account && user) {
        const accessTokenExpires = now + (account.expires_at ?? 0) * 1000;
        return {
          accessToken: account.access_token ?? "",
          accessTokenExpires,
          refreshToken: account.refresh_token ?? "",
          user,
        };
      }

      if (now < token.accessTokenExpires) {
        return token;
      }
      // Access token has expired, try to update it
      return refreshToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.error = token.error;

      return session;
    },
  },
};

export default NextAuth(authOptions);
