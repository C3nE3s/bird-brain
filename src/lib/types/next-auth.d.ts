import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    name?: string | null;
    image?: string | null;
    userName?: string | null;
  }
}

// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken: string | undefined;
//     accessTokenExpires: number | undefined;
//     refreshToken: string | undefined;
//     error?: string;
//   }
// }
