// src/lib/subscription.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Throws a redirect (to login or pricing) if the current request's session
 * user is not authenticated or does not have an ACTIVE subscription.
 *
 * Use from server components / server route handlers.
 */
export async function ensureActiveSubscription(redirectToLogin = true) {
  const session = await getServerSession(authOptions);

  // Not logged in -> redirect to login (with callback back)
  if (!session?.user) {
    if (redirectToLogin) {
      // Next.js server helper: throw a redirect from server components / handlers
      // but we return structured value here so callers can choose how to handle it.
      return { ok: false, reason: "not_authenticated", loginUrl: `/login` };
    }
    return { ok: false, reason: "not_authenticated" };
  }

  // Prefer id if you added it to session via NextAuth callback (recommended)
  const userId = (session.user as any).id ?? null;
  const email = session.user?.email?.toLowerCase?.() ?? null;

  // Find user (try id first, then email)
  let user = null;
  if (userId) {
    user = await db.user.findUnique({ where: { id: userId }, include: { subscription: true } });
  }
  if (!user && email) {
    user = await db.user.findFirst({ where: { email }, include: { subscription: true } });
  }

  if (!user) {
    return { ok: false, reason: "no_user_record" };
  }

  const sub = user.subscription;
  const isActive = !!sub && sub.status === "ACTIVE";

  if (!isActive) {
    return { ok: false, reason: "no_active_subscription", user, subscription: sub ?? null };
  }

  // success
  return { ok: true, user, subscription: sub };
}
