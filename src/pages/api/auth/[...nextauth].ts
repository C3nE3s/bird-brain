import NextAuth, { Account, User } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";
import { JWT } from "next-auth/jwt";


const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, NEXTAUTH_SECRET } =
  process.env;

const PKCE_SCOPES = [
  "tweet.read",
  "users.read",
  "bookmark.read",
  "bookmark.write",
  "offline.access",
];

async function refreshAccessToken(token: JWT) {
  try {
    const url =
      "https://api.twitter.com/2/oauth2/token?" +
      new URLSearchParams({
        client_id: TWITTER_CLIENT_ID as string,
        client_secret: TWITTER_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string
      })

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    })

    const refreshToken = await response.json()

    if (!response.ok) {
      throw refreshToken
    }

    // Give a 30 sec buffer
    const now = new Date()
    const exp = now.setSeconds(
      now.getSeconds() + parseInt(refreshToken.expires_in) - 10,
    )

    return {
      accessToken: refreshToken.access_token,
      accessTokenExpires: exp, 
      refreshToken: refreshToken.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.error("Auth", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}


export default NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60 // 2 hours
  },
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
  callbacks: {
    async jwt({ token, user, account }) {
      // returns the properties of the token that will be available to the client
      const now = Date.now()
      // Initial sign in
      if(account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? (now + (account.expires_at * 1000)) : (now),
          refreshToken: account.refresh_token as string,
        }
      }

      if(token.accessTokenExpires && now < token.accessTokenExpires) {
        return token
      }

      return refreshAccessToken(token)
    },
    session: async ({ session, user }) => {
      const { id, email, emailVerified, ...sessionUserProps } = user;
      session.user = sessionUserProps;
      return session;
  },
});
