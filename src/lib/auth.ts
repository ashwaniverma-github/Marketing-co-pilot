import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // Use Twitter API v2
      authorization: {
        params: {
          scope: "tweet.read users.read tweet.write offline.access",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // Track last provider used
        (token as unknown as { provider?: string }).provider = account.provider;
      }
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client
      if (token) {
        (session as unknown as { accessToken?: string; userId?: string }).accessToken = (token as unknown as { accessToken?: string }).accessToken;
        (session as unknown as { userId?: string }).userId = (token as unknown as { userId?: string }).userId || user?.id;
        (session as unknown as { provider?: string }).provider = (token as unknown as { provider?: string }).provider;
      }

      // Ensure session has user data (works for both JWT and DB strategies)
      if (session.user) {
        const t = token as unknown as { userId?: string; sub?: string };
        session.user.id = t?.userId || t?.sub || (user as unknown as { id?: string })?.id || session.user.id;
      }

      // Add connection flags
      try {
        const userId = (session.user as { id?: string })?.id;
        if (userId) {
          const twitter = await db.account.findFirst({ where: { userId, provider: 'twitter' }, select: { id: true } });
          (session as unknown as { hasTwitter?: boolean }).hasTwitter = !!twitter;
        }
      } catch {
        // ignore session enrichment errors
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // Save additional user info if needed
      if (account?.provider === "twitter" && profile) {
        try {
          // Type guard for Twitter profile with proper typing
          const twitterProfile = profile as {
            name?: string;
            picture?: string;
            profile_image_url?: string;
            username?: string;
            id?: string;
            [key: string]: any;
          };

          // Check if user already exists
          const existingUser = await db.user.findUnique({
            where: { id: user.id },
          });

          if (existingUser) {
            // Update existing user with Twitter-specific info
            await db.user.update({
              where: { id: user.id },
              data: {
                name: twitterProfile.name || user.name || existingUser.name,
                image: twitterProfile.picture || twitterProfile.profile_image_url || user.image || existingUser.image,
              },
            });
          } else {
            // This shouldn't happen as NextAuth creates the user first, but handle it just in case
            console.log("User doesn't exist yet, letting NextAuth create it first");
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          // Don't fail the sign-in process, just log the error
        }
      }

      if (account?.provider === "google" && profile) {
        try {
          const googleProfile = profile as {
            name?: string;
            picture?: string;
            email?: string;
            sub?: string;
            [key: string]: any;
          };

          const existingUser = await db.user.findUnique({
            where: { id: user.id },
          });

          if (existingUser) {
            await db.user.update({
              where: { id: user.id },
              data: {
                name: googleProfile.name || user.name || existingUser.name,
                image: googleProfile.picture || user.image || existingUser.image,
                email: (user as any).email || googleProfile.email || existingUser.email,
              },
            });
          }
        } catch (error) {
          console.error("Error updating Google profile:", error);
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
