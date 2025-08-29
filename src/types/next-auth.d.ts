import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: string;
    provider?: string;
    hasTwitter?: boolean;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
