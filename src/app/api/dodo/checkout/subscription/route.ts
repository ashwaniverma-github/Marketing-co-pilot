// src/app/api/dodo/checkout/subscription/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { dodopayments } from "@/lib/dodopayments";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const quantityParam = url.searchParams.get("quantity");
    const quantity = quantityParam ? Number(quantityParam) : 1;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // server-side session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      // return JSON instructing client to redirect to login
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(request.url)}`;
      return NextResponse.json({ loginUrl }, { status: 401 });
    }

    // find user record
    let user = null;
    if (session.user?.id) {
      user = await db.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } });
    }
    if (!user && session.user?.email) {
      user = await db.user.findFirst({ where: { email: session.user.email.toLowerCase() }, include: { subscription: true } });
    }
    if (!user) {
      return NextResponse.json({ error: "Authenticated session found but no user record in DB" }, { status: 404 });
    }

    const normalizedEmail = user.email ? user.email.toLowerCase() : undefined;

    // Build payload
    const payload: any = {
      product_cart: [{ product_id: String(productId), quantity: Number(quantity) || 1 }],
      metadata: { userId: user.id, userEmail: normalizedEmail },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
    };

    if (user.subscription?.dodoCustomerId) {
      payload.customer = { customer_id: user.subscription.dodoCustomerId };
    } else {
      payload.customer = { email: normalizedEmail, ...(user.name ? { name: user.name } : {}) };
    }

    const clientAny = dodopayments as any;
    let checkoutResponse: any;

    try {
      if (clientAny?.checkoutSessions && typeof clientAny.checkoutSessions.create === "function") {
        checkoutResponse = await clientAny.checkoutSessions.create(payload);
      } else if (clientAny?.checkout_sessions && typeof clientAny.checkout_sessions.create === "function") {
        checkoutResponse = await clientAny.checkout_sessions.create(payload);
      } else if (typeof clientAny.createCheckout === "function") {
        checkoutResponse = await clientAny.createCheckout(payload);
      } else if (typeof clientAny.checkouts === "function") {
        checkoutResponse = await clientAny.checkouts(payload);
      } else {
        return NextResponse.json({
          error: "dodopayments client does not expose a known checkout creation method",
          availableKeys: Object.keys(clientAny || {})
        }, { status: 500 });
      }
    } catch (sdkErr: any) {
      const providerBody = sdkErr?.response?.body ?? sdkErr?.response?.data ?? sdkErr?.body ?? sdkErr?.data;
      console.error("Dodo SDK error creating checkout:", sdkErr?.message ?? sdkErr, "providerBody:", providerBody);
      return NextResponse.json({
        error: "Failed to create checkout session",
        sdkError: String(sdkErr?.message ?? sdkErr),
        providerBody: providerBody ?? null,
        sentPayload: payload
      }, { status: sdkErr?.status ?? 422 });
    }

    // create pending sentinel (non-fatal)
    try {
      const sentinel = checkoutResponse?.session_id ?? checkoutResponse?.checkout_id ?? checkoutResponse?.id ?? `pending_${Date.now()}`;
      await db.payment.create({
        data: {
          userId: user.id,
          subscriptionId: null,
          dodoPaymentId: `pending_${String(sentinel)}`,
          amount: 0,
          currency: "USD",
          status: "PENDING",
          paymentMethod: "checkout",
          processedAt: new Date()
        }
      }).catch(() => {});
    } catch (e) {
      console.warn("Failed to create pending payment sentinel", e);
    }

    // determine checkout URL
    const possibleUrls = [
      checkoutResponse?.checkout_url,
      checkoutResponse?.payment_link,
      checkoutResponse?.url,
      checkoutResponse?.session_url,
      checkoutResponse?.payment_link_url,
      checkoutResponse?.data?.checkout_url,
      checkoutResponse?.data?.payment_link
    ];
    const checkoutUrl = possibleUrls.find(Boolean) as string | undefined;

    if (!checkoutUrl) {
      return NextResponse.json({
        error: "Checkout created but no redirect URL found in SDK response. Inspect sdkResponse.",
        sdkResponse: checkoutResponse
      }, { status: 500 });
    }

    // Return JSON with checkout URL (client will navigate)
    return NextResponse.json({ checkoutUrl }, { status: 200 });
  } catch (err: any) {
    console.error("create-checkout (subscription) error:", err);
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 });
  }
}
