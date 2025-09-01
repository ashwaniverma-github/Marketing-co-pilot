// src/lib/auth.ts
import crypto from "crypto";
import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { Prisma } from "@prisma/client";

/* -------------------------------------------------------------
   Utilities & helpers
   ------------------------------------------------------------- */

function resolveTwitterUsername(profile: any) {
  return (
    profile?.username ||
    profile?.data?.username ||
    profile?.screen_name ||
    profile?.login ||
    profile?.screenName ||
    profile?.user?.username ||
    undefined
  );
}

function interpretVerified(d: any) {
  if (!d) return false;
  if (d.verified === true || d.verified === "true") return true;
  if (typeof d.verified_type === "string" && d.verified_type !== "none") return true;
  if (d.verified === 1) return true;
  return false;
}

async function fetchWithRateLog(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  if (res.status === 429) {
    console.warn("Twitter returned 429 Too Many Requests for:", url);
    console.warn("Rate-limit headers:", {
      limit: res.headers.get("x-rate-limit-limit"),
      remaining: res.headers.get("x-rate-limit-remaining"),
      reset: res.headers.get("x-rate-limit-reset"),
    });
    const body = await res.text().catch(() => "[unreadable body]");
    console.warn("429 response body:", body);
  }
  return res;
}

/* --- cached app-only bearer token to avoid repeated client_credentials calls --- */
let cachedAppBearer: { token: string; expiresAt: number } | null = null;
async function getCachedAppBearerToken() {
  if (cachedAppBearer && cachedAppBearer.expiresAt > Date.now() + 60_000) {
    return cachedAppBearer.token;
  }

  const key = process.env.TWITTER_CLIENT_ID;
  const secret = process.env.TWITTER_CLIENT_SECRET;
  if (!key || !secret) return null;

  try {
    const res = await fetchWithRateLog("https://api.twitter.com/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: "grant_type=client_credentials",
    });

    const body = await res.json().catch(() => null);
    if (res.ok && body?.access_token) {
      const expiresIn = Number(body.expires_in) || 60 * 60;
      cachedAppBearer = { token: body.access_token, expiresAt: Date.now() + expiresIn * 1000 };
      console.log("Fetched app-only bearer token (cached). expiresIn:", expiresIn);
      return cachedAppBearer.token;
    } else {
      console.warn("Failed to fetch app-only bearer token", res.status, body);
      return null;
    }
  } catch (err) {
    console.error("getCachedAppBearerToken error:", err);
    return null;
  }
}

/* --- OAuth1.0a header builder (for v1.1 fallback) --- */
function buildOAuth1Header({
  consumerKey,
  consumerSecret,
  token,
  tokenSecret,
  method,
  baseUrl,
  queryParams,
}: {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  method: string;
  baseUrl: string;
  queryParams: Record<string, string>;
}) {
  const rfc3986 = (s: string) =>
    encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: token,
    oauth_version: "1.0",
  };

  const allParams: Array<[string, string]> = [];
  for (const k of Object.keys(oauthParams)) allParams.push([k, oauthParams[k]]);
  for (const k of Object.keys(queryParams)) allParams.push([k, String(queryParams[k])]);

  const paramString = allParams
    .map(([k, v]) => [rfc3986(k), rfc3986(v)])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const baseString = `${method.toUpperCase()}&${rfc3986(baseUrl)}&${rfc3986(paramString)}`;
  const signingKey = `${rfc3986(consumerSecret)}&${rfc3986(tokenSecret)}`;

  oauthParams["oauth_signature"] = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

  const header =
    "OAuth " +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${rfc3986(k)}="${rfc3986(oauthParams[k])}"`)
      .join(", ");

  return header;
}

/* -------------------------------------------------------------
   Auth options
   ------------------------------------------------------------- */

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(db),
    // Safer createUser that tolerates missing email in OAuth providers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: async (data: any) => {
      try {
        const name = (data.name as string) ?? undefined;
        const image = (data.image as string) ?? undefined;
        const emailProvided = (data.email as string) ?? null;
        const emailVerified = data.emailVerified ?? null;

        const allowNullEmail = process.env.NEXTAUTH_ALLOW_MISSING_EMAIL === "true";
        const email = emailProvided ?? (allowNullEmail ? null : `no-email-${Date.now()}@missing.local`);

        const userData: any = { name, image };
        if (email !== null) userData.email = email;
        if (emailVerified !== null) userData.emailVerified = emailVerified;

        const created = await db.user.create({ data: userData });
        console.log("Adapter.createUser created:", { id: created.id, email: created.email ?? null });
        return created;
      } catch (err) {
        console.error("Adapter.createUser error:", err);
        throw err;
      }
    },
  },

  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "tweet.read users.read tweet.write offline.access",
        },
      },
      profile(profile) {
        const d = (profile as any).data ?? profile;
        return {
          id: d?.id ?? profile?.id,
          name: d?.name ?? profile?.name,
          username: d?.username ?? profile?.username,
          email: undefined,
          image: d?.profile_image_url ?? profile?.profile_image_url ?? profile?.picture,
          twitterProfile: profile,
          verified: d?.verified ?? profile?.verified,
          verified_type: d?.verified_type ?? profile?.verified_type,
        } as any;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        console.log("JWT callback: account summary:", {
          provider: account.provider,
          type: account.type,
          providerAccountId: account.providerAccountId,
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expires_at: account.expires_at,
        });

        token.accessToken = account.access_token ?? token.accessToken;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        (token as any).provider = account.provider ?? (token as any).provider;

        (token as any).oauth_token = (account as any).oauth_token ?? (token as any).oauth_token;
        (token as any).oauth_token_secret = (account as any).oauth_token_secret ?? (token as any).oauth_token_secret;

        if (account.expires_at) {
          const ms = Number(account.expires_at) * 1000;
          (token as any).expiresAt = ms;
        }
      }

      const REFRESH_BUFFER_MS = 5 * 60 * 1000;
      const t = token as any;

      async function refreshTwitterTokenIfNeeded() {
        try {
          if (!t.refreshToken || !t.expiresAt) return;
          if (Date.now() + REFRESH_BUFFER_MS < Number(t.expiresAt)) return;

          console.log("Refreshing Twitter token (once).");

          const response = await fetchWithRateLog("https://api.twitter.com/2/oauth2/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: String(t.refreshToken),
            }),
          });

          const body = await response.json().catch(() => null);
          console.log("Twitter refresh response:", response.status, body);
          if (!response.ok || !body?.access_token) {
            console.warn("Twitter token refresh failed; skipping updates.");
            return;
          }

          t.accessToken = body.access_token;
          t.refreshToken = body.refresh_token ?? t.refreshToken;
          t.expiresAt = Date.now() + Number(body.expires_in) * 1000;

          try {
            if (t.userId) {
              await db.account.updateMany({
                where: { userId: t.userId, provider: "twitter" },
                data: {
                  access_token: t.accessToken,
                  refresh_token: t.refreshToken,
                  expires_at: Math.floor(t.expiresAt / 1000),
                },
              });
            }
          } catch (dbErr) {
            console.warn("Failed to persist refreshed Twitter tokens to DB:", dbErr);
          }
        } catch (err) {
          console.error("Error refreshing Twitter token:", err);
        }
      }

      if ((token as any).provider === "twitter") {
        await refreshTwitterTokenIfNeeded();
      }

      if (user) {
        token.userId = user.id;
        console.log("JWT callback - Setting userId:", {
          userId: user.id,
          userEmail: user.email,
          userProvider: (token as any).provider,
        });
      }
      return token;
    },

    async session({ session, token, user }) {
      console.log("Session callback - Input:", {
        sessionUserId: session?.user?.id,
        tokenUserId: (token as any)?.userId,
        userParamId: user?.id,
        tokenKeys: Object.keys(token || {}),
      });

      if (token) {
        (session as any).accessToken = (token as any).accessToken;
        (session as any).userId = (token as any).userId || user?.id;
        (session as any).provider = (token as any).provider;
      }

      if (session.user) {
        const t = token as any;
        session.user.id = t?.userId || (user as any)?.id || session.user.id;

        console.log("Session callback - After setting user.id:", {
          finalUserId: session.user.id,
          tokenUserId: t?.userId,
          userParamId: user?.id,
        });

        try {
          const uid = session.user.id;
          if (uid) {
            const sa = await db.socialAccount.findFirst({
              where: { userId: uid, platform: "TWITTER" },
              include: { account: true },
            });
            if (sa) {
              (session as any).xUsername = sa.username;
              (session as any).xAvatar = sa.avatar;
              (session as any).xVerified = sa.isVerified;
              (session as any).xDisplayName = sa.displayName;
              (session as any).hasXConnection = !!sa.accountId;
            }
          }
        } catch (e) {
          console.error("session callback: error fetching socialAccount:", e);
        }
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      // Google: update user fields
      if (account?.provider === "google" && profile && user?.id) {
        try {
          const googleProfile = profile as any;
          const existingUser = await db.user.findUnique({ where: { id: user.id } });
          if (existingUser) {
            await db.user.update({
              where: { id: user.id },
              data: {
                name: googleProfile?.name ?? user.name ?? existingUser.name,
                image: googleProfile?.picture ?? user.image ?? existingUser.image,
                email: (user as any).email ?? googleProfile?.email ?? existingUser.email,
              },
            });
          }
        } catch (err) {
          console.error("signIn callback (google) error:", err);
        }
        return true;
      }

      // Twitter sign-in
      if (!account || account.provider !== "twitter" || !user?.id) return true;

      console.log("signIn: Twitter sign-in started", {
        userId: user.id,
        providerAccountId: account.providerAccountId,
        hasAccessToken: !!(account as any).access_token,
      });

      try {
        const providerProfile = (profile as any) ?? {};
        const twitterProfile = providerProfile.twitterProfile ?? providerProfile;
        const d = twitterProfile?.data ?? twitterProfile;

        const platformUserId = String(d?.id ?? providerProfile.id ?? account.providerAccountId ?? "");
        let username = providerProfile.username ?? resolveTwitterUsername(providerProfile) ?? "";
        const displayName = providerProfile.name ?? d?.name ?? "";

        if (!username && platformUserId) username = `@${platformUserId}`;

        console.log("signIn: extracted profile data", {
          platformUserId,
          username,
          displayName,
          hasImage: !!(providerProfile.image ?? d?.profile_image_url ?? twitterProfile?.profile_image_url),
        });

        // Create or update SocialAccount
        let socialAccount = null;
        try {
          socialAccount = await db.socialAccount.findFirst({
            where: {
              userId: user.id,
              platform: "TWITTER",
              platformUserId,
            },
          });

          const avatar = providerProfile.image ?? d?.profile_image_url ?? twitterProfile?.profile_image_url ?? "";

          if (socialAccount) {
            socialAccount = await db.socialAccount.update({
              where: { id: socialAccount.id },
              data: {
                username,
                displayName,
                avatar,
                isVerified: false,
                isActive: true,
              },
            });
            console.log("signIn: updated existing socialAccount id:", socialAccount?.id);
          } else {
            socialAccount = await db.socialAccount.create({
              data: {
                platform: "TWITTER",
                platformUserId,
                username,
                displayName,
                avatar,
                isVerified: false,
                isActive: true,
                userId: user.id,
              },
            });
            console.log("signIn: created new socialAccount id:", socialAccount?.id);
          }
        } catch (dbErr) {
          console.error("signIn: socialAccount creation/update error:", dbErr);
        }

        // Link with Account record if present
        if (socialAccount) {
          try {
            const accountRecord = await db.account.findFirst({
              where: { userId: user.id, provider: "twitter" },
            });

            if (accountRecord) {
              await db.socialAccount.update({
                where: { id: socialAccount.id },
                data: { accountId: accountRecord.id },
              });
              console.log("signIn: linked socialAccount with account:", accountRecord.id);
            } else {
              console.log("signIn: no account record found for linking");
            }
          } catch (linkErr) {
            console.error("signIn: account linking error:", linkErr);
          }
        } else {
          console.error("signIn: failed to create/update socialAccount");
        }

        // Determine authoritative verification state using multiple fallbacks
        let apiVerified: boolean | null = null;

        // A: v2 with user access token
        if ((account as any).access_token) {
          try {
            const token = (account as any).access_token;
            const res = await fetchWithRateLog(
              `https://api.twitter.com/2/users/${encodeURIComponent(platformUserId)}?user.fields=verified,verified_type`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const text = await res.text();
            let json: any = null;
            try {
              json = JSON.parse(text);
            } catch {
              json = null;
            }
            console.log("v2 /2/users/:id response:", res.status, json ?? text);
            const d2 = json?.data ?? json;
            if (d2) apiVerified = interpretVerified(d2);
            else apiVerified = null;
          } catch (err) {
            console.error("v2 user token fetch failed:", err);
            apiVerified = null;
          }
        } else {
          console.log("No OAuth2 user access_token present; skipping v2 user fetch.");
          apiVerified = null;
        }

        // B: v2 app-only fallback (cached)
        if (apiVerified === null) {
          const appBearer = await getCachedAppBearerToken();
          if (appBearer) {
            try {
              const res = await fetchWithRateLog(
                `https://api.twitter.com/2/users/${encodeURIComponent(platformUserId)}?user.fields=verified,verified_type`,
                { headers: { Authorization: `Bearer ${appBearer}` } }
              );
              const text = await res.text();
              let json: any = null;
              try {
                json = JSON.parse(text);
              } catch {
                json = null;
              }
              console.log("v2 app-only response:", res.status, json ?? text);
              const d3 = json?.data ?? json;
              if (d3) apiVerified = interpretVerified(d3);
              else apiVerified = null;
            } catch (err) {
              console.error("v2 app-only fetch failed:", err);
              apiVerified = null;
            }
          } else {
            console.log("No app-only token available; skipping app-only v2 fallback.");
          }
        }

        // C: OAuth1 v1.1 users/show.json signed request fallback
        if (apiVerified === null && (account as any).oauth_token && (account as any).oauth_token_secret) {
          try {
            const oauthToken = (account as any).oauth_token;
            const oauthTokenSecret = (account as any).oauth_token_secret;
            const consumerKey = process.env.TWITTER_CLIENT_ID!;
            const consumerSecret = process.env.TWITTER_CLIENT_SECRET!;

            const baseUrl = "https://api.twitter.com/1.1/users/show.json";
            const query = { user_id: platformUserId };

            const authHeader = buildOAuth1Header({
              consumerKey,
              consumerSecret,
              token: oauthToken,
              tokenSecret: oauthTokenSecret,
              method: "GET",
              baseUrl,
              queryParams: query,
            });

            const qs = `?user_id=${encodeURIComponent(platformUserId)}`;
            const res = await fetchWithRateLog(baseUrl + qs, {
              method: "GET",
              headers: { Authorization: authHeader, Accept: "application/json" },
            });

            const text = await res.text();
            let json1: any = null;
            try {
              json1 = JSON.parse(text);
            } catch {
              json1 = null;
            }
            console.log("v1.1 users/show response:", res.status, json1 ?? text);
            if (json1) apiVerified = interpretVerified(json1);
            else apiVerified = null;
          } catch (err) {
            console.error("v1.1 users/show failed:", err);
            apiVerified = null;
          }
        } else {
          if (apiVerified === null) console.log("No OAuth1 credentials present for v1.1 fallback.");
        }

        // Write final verification to DB if determined
        if (typeof apiVerified === "boolean") {
          console.log("Final verification from API:", apiVerified);
          try {
            if (socialAccount && socialAccount.id) {
              await db.socialAccount.update({
                where: { id: socialAccount.id },
                data: { isVerified: apiVerified },
              });
              console.log("Updated socialAccount.isVerified ->", apiVerified);
            } else {
              console.log("socialAccount missing; skipping isVerified update.");
            }
          } catch (err) {
            console.error("Failed to update socialAccount.isVerified:", err);
          }
        } else {
          console.warn("Could not determine verified status from Twitter APIs. See logs above.");
        }
      } catch (err) {
        console.error("signIn (twitter) unexpected error:", err);
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch (e) {}
      return `${baseUrl}/dashboard`;
    },
  },

  session: { strategy: "jwt" },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
