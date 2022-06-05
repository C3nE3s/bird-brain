import type { JWT } from "next-auth/jwt";

interface RefreshTokenResponse {
  id_token: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
}

const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } = process.env;

export async function refreshToken(token: JWT) {
  const now = Date.now();

  try {
    const url =
      "https://api.twitter.com/2/oauth2/token?" +
      new URLSearchParams({
        client_id: TWITTER_CLIENT_ID as string,
        client_secret: TWITTER_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token as string,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const freshToken: RefreshTokenResponse = await response.json();

    if (!response.ok) {
      throw { freshToken };
    }

    return {
      ...token,
      accessToken: freshToken.access_token,
      accessTokenExpires: now + freshToken.expires_in * 1000,
      refreshToken: freshToken.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
