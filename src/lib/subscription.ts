// src/lib/subscription.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
    user = await db.user.findUnique({ 
      where: { id: userId }, 
      include: { 
        subscription: true, 
        oneTimePurchases: {
          where: { status: "SUCCEEDED" },
          orderBy: { completedAt: "desc" },
          take: 1
        } 
      } 
    });
  }
  if (!user && email) {
    user = await db.user.findFirst({ 
      where: { email }, 
      include: { 
        subscription: true, 
        oneTimePurchases: {
          where: { status: "SUCCEEDED" },
          orderBy: { completedAt: "desc" },
          take: 1
        } 
      } 
    });
  }

  if (!user) {
    return { ok: false, reason: "no_user_record" };
  }

  // Check for active subscription or valid one-time purchase
  const sub = user.subscription;
  const oneTimePurchase = user.oneTimePurchases?.[0];
  
  const isActiveSubscription = !!sub && sub.status === "ACTIVE";
  const isValidOneTimePurchase = !!oneTimePurchase && 
    user.plan === "PRO" && 
    // Optional: Add expiration logic if needed
    (!oneTimePurchase.completedAt || 
     (new Date(oneTimePurchase.completedAt).getTime() > Date.now() - 365 * 24 * 60 * 60 * 1000));

  if (!isActiveSubscription && !isValidOneTimePurchase) {
    return { 
      ok: false, 
      reason: "no_active_subscription", 
      user, 
      subscription: sub ?? null,
      oneTimePurchase: oneTimePurchase ?? null
    };
  }

  // success
  return { 
    ok: true, 
    user, 
    subscription: sub,
    oneTimePurchase: oneTimePurchase ?? null
  };
}

/**
 * Track and limit free usage for users without an active subscription
 */
export async function trackFreeUsage(request: NextRequest) {
  const freeUsageCookie = request.cookies.get('free_usage')?.value;
  
  let freeUsage = freeUsageCookie 
    ? parseInt(freeUsageCookie, 10) 
    : 0;

  // Increment usage
  freeUsage += 1;

  // Prepare response with updated cookie
  const response = NextResponse.json({
    usageCount: freeUsage,
    isLimitReached: freeUsage > 3 // Allow 3 free uses
  });

  // Set cookie with max age of 30 days
  response.cookies.set('free_usage', freeUsage.toString(), {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    sameSite: 'strict'
  });

  return response;
}
