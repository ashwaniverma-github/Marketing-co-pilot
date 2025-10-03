// src/lib/auth.ts
import crypto from "crypto";
import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { Prisma } from "@prisma/client";
import { captureServerEvent, identifyServerUser } from "./analytics";

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
  
  console.log("Checking verification for data:", JSON.stringify(d, null, 2));
  
  // Check direct verified flags
  if (d.verified === true || d.verified === "true" || d.verified === 1) {
    console.log("Found direct verified flag");
    return true;
  }
  
  // Check verified_type
  if (d.verified_type) {
    console.log("Found verified_type:", d.verified_type);
    // Any non-empty verified_type except 'none' indicates verification
    if (typeof d.verified_type === "string" && d.verified_type !== "none" && d.verified_type !== "") {
      return true;
    }
  }

  // Check Twitter Blue / X Premium
  if (d.is_blue_verified === true || d.blue_verified === true) {
    console.log("Found blue verification");
    return true;
  }

  // Check Twitter Circle
  if (d.verified_type === "Blue Verified" || d.verified_type === "Blue") {
    console.log("Found Blue verified type");
    return true;
  }

  // Check business type
  if (d.verified_type === "Business" || d.is_business === true) {
    console.log("Found business verification");
    return true;
  }

  // Check government type
  if (d.verified_type === "Government" || d.is_government === true) {
    console.log("Found government verification");
    return true;
  }

  // Check legacy verification
  if (d.verified_type === "Legacy Verified" || d.verified_type === "legacy") {
    console.log("Found legacy verification");
    return true;
  }

  // Check additional profile fields
  if (d.profile_interstitial_type === 'verified' || d.protected === true) {
    console.log("Found verification in profile fields");
    return true;
  }

  // Check entities
  if (d.entities?.description?.urls?.some((u: any) => u.display_url?.includes('verified'))) {
    console.log("Found verification in profile URLs");
    return true;
  }

  return false;
}

async function fetchWithRateLog(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  const text = await res.text();
  
  if (res.status === 429) {
    console.warn("Twitter returned 429 Too Many Requests for:", url);
    console.warn("Rate-limit headers:", {
      limit: res.headers.get("x-rate-limit-limit"),
      remaining: res.headers.get("x-rate-limit-remaining"),
      reset: res.headers.get("x-rate-limit-reset"),
    });
    console.warn("429 response body:", text);
  }
  
  return { status: res.status, text, headers: res.headers };
}

/* --- cached app-only bearer token to avoid repeated client_credentials calls --- */
let cachedAppBearer: { token: string; expiresAt: number } | null = null;
async function getCachedAppBearerToken() {
  // First try to use the bearer token from env
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (bearerToken) {
    console.log("Using bearer token from environment");
    return bearerToken;
  }

  // Fallback to client credentials if no bearer token
  if (cachedAppBearer && cachedAppBearer.expiresAt > Date.now() + 60_000) {
    return cachedAppBearer.token; 
  }

  const key = process.env.TWITTER_CLIENT_ID;
  const secret = process.env.TWITTER_CLIENT_SECRET;
  if (!key || !secret) {
    console.warn("No Twitter credentials available (neither bearer token nor client credentials)");
    return null;
  }

  try {
    const res = await fetchWithRateLog("https://api.twitter.com/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: "grant_type=client_credentials",
    });

    let body = null;
    try {
      body = JSON.parse(res.text);
    } catch (e) {
      console.error("Failed to parse token response:", e);
      return null;
    }
    
    if (res.status === 200 && body?.access_token) {
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
        console.log("Raw Twitter profile data:", JSON.stringify(profile, null, 2));
        
        // Extract all possible verification indicators
        const verificationData = {
          verified: d?.verified ?? profile?.verified,
          verified_type: d?.verified_type ?? profile?.verified_type,
          is_blue_verified: d?.is_blue_verified ?? profile?.is_blue_verified,
          blue_verified: d?.blue_verified ?? profile?.blue_verified,
          is_business: d?.is_business ?? profile?.is_business,
          is_government: d?.is_government ?? profile?.is_government,
          profile_interstitial_type: d?.profile_interstitial_type ?? profile?.profile_interstitial_type,
          protected: d?.protected ?? profile?.protected,
          entities: d?.entities ?? profile?.entities,
        };
        
        console.log("Extracted verification data:", verificationData);
        
        return {
          id: d?.id ?? profile?.id,
          name: d?.name ?? profile?.name,
          username: d?.username ?? profile?.username,
          email: undefined,
          image: d?.profile_image_url ?? profile?.profile_image_url ?? profile?.picture,
          twitterProfile: profile,
          ...verificationData,
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
    async jwt({ token, account, user, profile }) {
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

          // Store Twitter profile data in token for first-time processing
          if (account.provider === "twitter" && profile) {
            (token as any)._twitterProfile = profile;
            (token as any)._twitterAccount = account;
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
              refresh_token: t.refreshToken.toString(),
            }),
          });

          let body = null;
          try {
            body = JSON.parse(response.text);
          } catch (e) {
            console.error("Failed to parse refresh token response:", e);
            return;
          }

          console.log("Twitter refresh response:", response.status, body);
          if (response.status !== 200 || !body?.access_token) {
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

        // Process Twitter account on first session if needed
        if (t?._twitterProfile && t?._twitterAccount && session.user.id) {
          try {
            const profile = t._twitterProfile;
            const account = t._twitterAccount;
            
            const providerProfile = profile ?? {};
            const twitterProfile = providerProfile.twitterProfile ?? providerProfile;
            const d = twitterProfile?.data ?? twitterProfile;

            const platformUserId = (d?.id ?? providerProfile.id ?? account.providerAccountId ?? "").toString();
            let username = providerProfile.username ?? resolveTwitterUsername(providerProfile) ?? "";
            const displayName = providerProfile.name ?? d?.name ?? "";
            const avatar = providerProfile.image ?? d?.profile_image_url ?? twitterProfile?.profile_image_url ?? "";

            if (!username && platformUserId) username = `@${platformUserId}`;

            // Create or update social account
            let socialAccount = await db.socialAccount.findFirst({
              where: {
                platform: "TWITTER",
                platformUserId,
              },
            });

            if (socialAccount) {
              socialAccount = await db.socialAccount.update({
                where: { id: socialAccount.id },
                data: {
                  userId: session.user.id,
                  username,
                  displayName,
                  avatar,
                  isActive: true,
                },
              });
            } else {
              socialAccount = await db.socialAccount.create({
                data: {
                  platform: "TWITTER",
                  platformUserId,
                  username,
                  displayName,
                  avatar,
                  isActive: true,
                  userId: session.user.id,
                },
              });
            }

            if (socialAccount) {
              // Link with Account record
              const accountRecord = await db.account.findFirst({
                where: { userId: session.user.id, provider: "twitter" },
              });

              if (accountRecord) {
                await db.socialAccount.update({
                  where: { id: socialAccount.id },
                  data: { accountId: accountRecord.id },
                });
              }

              // Handle verification
              await handleTwitterVerification(socialAccount, account, profile);
            }
          } catch (error) {
            console.error("Session Twitter account processing error:", error);
          }
        }

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

      try {
        const uid = (session as any)?.user?.id || (token as any)?.userId;
        if (uid) {
          // Check for active subscription
          const userWithSubscription = await db.user.findUnique({
            where: { id: uid },
            include: { subscription: true }
          });

          const hasActiveSubscription = !!userWithSubscription?.subscription && 
            userWithSubscription.subscription.status === 'ACTIVE';

          (session as any).hasActiveSubscription = hasActiveSubscription;

          identifyServerUser(String(uid), {
            email: session?.user?.email,
            name: session?.user?.name,
          });
          captureServerEvent(String(uid), "session_active");
        }
      } catch (e) {
        // best-effort only
        console.error('Error checking subscription status:', e);
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      try {
        if (user?.id) {
          identifyServerUser(String(user.id), {
            email: (user as any)?.email,
            name: user.name,
            provider: account?.provider,
          });
          captureServerEvent(String(user.id), "user_sign_in", {
            provider: account?.provider,
          });
        }
      } catch {}
      // Google: create or update social account
      if (account?.provider === "google" && profile && user?.id) {
        try {
          const googleProfile = profile as any;
          const existingUser = await db.user.findUnique({ where: { id: user.id } });
          
          // Update user details
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

          // Check if social account already exists
          let socialAccount = await db.socialAccount.findFirst({
            where: {
              userId: user.id,
              platform: "GOOGLE",
              platformUserId: account.providerAccountId,
            },
          });

          // Create social account if it doesn't exist
          if (!socialAccount) {
            socialAccount = await db.socialAccount.create({
              data: {
                platform: "GOOGLE",
                platformUserId: account.providerAccountId,
                username: googleProfile?.email ?? "",
                displayName: googleProfile?.name ?? "",
                avatar: googleProfile?.picture ?? "",
                isVerified: googleProfile?.email_verified ?? false,
                isActive: true,
                userId: user.id,
              },
            });
          } else {
            // Update existing social account
            socialAccount = await db.socialAccount.update({
              where: { id: socialAccount.id },
              data: {
                username: googleProfile?.email ?? socialAccount.username,
                displayName: googleProfile?.name ?? socialAccount.displayName,
                avatar: googleProfile?.picture ?? socialAccount.avatar,
                isVerified: googleProfile?.email_verified ?? socialAccount.isVerified,
                isActive: true,
              },
            });
          }

          // Link with Account record
          if (socialAccount) {
            try {
              const accountRecord = await db.account.findFirst({
                where: { userId: user.id, provider: "google" },
              });

              if (accountRecord) {
                await db.socialAccount.update({
                  where: { id: socialAccount.id },
                  data: { accountId: accountRecord.id },
                });
              }
            } catch (linkErr) {
              console.error("signIn: Google account linking error:", linkErr);
            }
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

        const platformUserId = (d?.id ?? providerProfile.id ?? account.providerAccountId ?? "").toString();
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
        const text = res.text;
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
            `https://api.twitter.com/2/users/${encodeURIComponent(platformUserId)}?user.fields=verified,verified_type,protected,entities,description,profile_image_url,url,public_metrics`,
            { headers: { Authorization: `Bearer ${appBearer}` } }
          );
          const text = res.text;
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

        const text = res.text;
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

// Helper function to handle Twitter verification status
async function handleTwitterVerification(socialAccount: any, account: any, profile: any): Promise<void> {
  try {
    const providerProfile = profile ?? {};
    const twitterProfile = providerProfile.twitterProfile ?? providerProfile;
    const d = twitterProfile?.data ?? twitterProfile;
    const platformUserId = (d?.id ?? providerProfile.id ?? account.providerAccountId ?? "").toString();

    let apiVerified: boolean | null = null;

    try {
      // First check if verification info is in the profile
      const profileVerified = interpretVerified(d);
      if (profileVerified) {
        apiVerified = true;
        console.log("Verified status found in profile data");
      } else {
        // A: v2 with user access token
        if ((account as any).access_token) {
          try {
                      const token = (account as any).access_token;
          const res = await fetchWithRateLog(
            `https://api.twitter.com/2/users/${encodeURIComponent(platformUserId)}?user.fields=verified,verified_type,protected,entities,description,profile_image_url,url,public_metrics`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.status === 200) {
            let json: any = null;
            try {
              json = JSON.parse(res.text);
              console.log("v2 /2/users/:id response:", json);
              const d2 = json?.data ?? json;
              if (d2) {
                apiVerified = interpretVerified(d2);
                if (apiVerified) console.log("Verified status found via v2 API");
              }
            } catch (e) {
              console.error("Failed to parse v2 API response:", e);
              apiVerified = null;
            }
          } else if (res.status === 429) {
            console.log("Rate limited on v2 API, will try fallback methods");
            apiVerified = null;
          } else {
            console.error("v2 API request failed with status:", res.status);
            apiVerified = null;
          }
          } catch (err) {
            console.error("v2 user token fetch failed:", err);
            apiVerified = null;
          }
        }
      }
    } catch (err) {
      console.error("Error checking initial verification status:", err);
      apiVerified = null;
    }

    // B: v2 app-only fallback (cached)
    if (apiVerified === null) {
      const appBearer = await getCachedAppBearerToken();
      if (appBearer) {
        try {
          const res = await fetchWithRateLog(
            `https://api.twitter.com/2/users/${encodeURIComponent(platformUserId)}?user.fields=verified,verified_type,protected,entities,description,profile_image_url,url,public_metrics`,
            { headers: { Authorization: `Bearer ${appBearer}` } }
          );

          if (res.status === 200) {
            let json: any = null;
            try {
              json = JSON.parse(res.text);
              console.log("v2 app-only response:", json);
              const d3 = json?.data ?? json;
              if (d3) {
                apiVerified = interpretVerified(d3);
                if (apiVerified) console.log("Verified status found via app-only API");
              }
            } catch (e) {
              console.error("Failed to parse app-only API response:", e);
              apiVerified = null;
            }
          } else if (res.status === 429) {
            console.log("Rate limited on app-only API, will try v1.1 fallback");
            apiVerified = null;
          } else {
            console.error("App-only API request failed with status:", res.status);
            apiVerified = null;
          }
        } catch (err) {
          console.error("v2 app-only fetch failed:", err);
          apiVerified = null;
        }
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

        if (res.status === 200) {
          let json1: any = null;
          try {
            json1 = JSON.parse(res.text);
            console.log("v1.1 users/show response:", json1);
            if (json1) {
              apiVerified = interpretVerified(json1);
              if (apiVerified) console.log("Verified status found via v1.1 API");
            }
          } catch (e) {
            console.error("Failed to parse v1.1 API response:", e);
            apiVerified = null;
          }
        } else if (res.status === 429) {
          console.log("Rate limited on v1.1 API");
          apiVerified = null;
        } else {
          console.error("v1.1 API request failed with status:", res.status);
          apiVerified = null;
        }
      } catch (err) {
        console.error("v1.1 users/show failed:", err);
        apiVerified = null;
      }
    }

    // Update verification status
    if (typeof apiVerified === "boolean") {
      console.log("Final verification from API:", apiVerified);
      try {
        await db.socialAccount.update({
          where: { id: socialAccount.id },
          data: { isVerified: apiVerified },
        });
        console.log("Updated socialAccount.isVerified ->", apiVerified);
      } catch (err) {
        console.error("Failed to update socialAccount.isVerified:", err);
      }
    } else {
      console.warn("Could not determine verified status from Twitter APIs.");
    }
  } catch (error) {
    console.error("handleTwitterVerification error:", error);
  }
}
