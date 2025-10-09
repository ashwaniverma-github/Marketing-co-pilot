// src/app/api/dodo/checkout/one-time/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDodoPayments } from "@/lib/dodopayments";

/**
 * One-time checkout creator
 *
 * Uses Dodo Payments Checkout Sessions to create a one-time payment flow for a product.
 * Reference (Context7 docs):
 * - Node SDK checkout session example: https://github.com/dodopayments/dodopayments-node/blob/main/README.md
 * - API docs: https://github.com/dodopayments/dodopayments-node/blob/main/api.md
 *
 * Required:
 * - Authenticated user session
 * - productId (query) optional; defaults to configured product id
 * - quantity (query) optional; defaults to 1
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    // Default to provided product id if not supplied
   
    const defaultProductId = process.env.ONE_TIME_PRODUCT_ID
    const productId = url.searchParams.get("productId") || defaultProductId;
    const quantityParam = url.searchParams.get("quantity");
    const quantity = quantityParam ? Number(quantityParam) : 1;

    const dodopayments = getDodoPayments();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Require authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(request.url)}`;
      return NextResponse.json({ loginUrl }, { status: 401 });
    }

    // Resolve user in DB
    // Use a broad type to accept relation includes (subscription) from Prisma
    let user: any = null;
    if (session.user?.id) {
      user = await db.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } });
    }
    if (!user && session.user?.email) {
      user = await db.user.findFirst({
        where: { email: session.user.email.toLowerCase() },
        include: { subscription: true }
      });
    }
    if (!user) {
      return NextResponse.json(
        { error: "Authenticated session found but no user record in DB" },
        { status: 404 }
      );
    }

    const normalizedEmail = user.email ? user.email.toLowerCase() : undefined;

    // Build Checkout Session payload for one-time product
    const payload: any = {
      product_cart: [{ product_id: String(productId), quantity: Number(quantity) || 1 }],
      metadata: {
        userId: user.id,
        userEmail: normalizedEmail,
        checkoutType: "one_time",
        productId: String(productId)
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      // For one-time payments we typically don't need subscription_data
    };

    // Reuse existing customer if available from subscription record; otherwise pass email
    if (user.subscription?.dodoCustomerId) {
      payload.customer = { customer_id: user.subscription.dodoCustomerId };
    } else {
      payload.customer = { email: normalizedEmail, ...(user.name ? { name: user.name } : {}) };
    }

    // SDK compatibility shim (various client shapes)
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
        return NextResponse.json(
          {
            error: "dodopayments client does not expose a known checkout creation method",
            availableKeys: Object.keys(clientAny || {})
          },
          { status: 500 }
        );
      }
    } catch (sdkErr: any) {
      const providerBody = sdkErr?.response?.body ?? sdkErr?.response?.data ?? sdkErr?.body ?? sdkErr?.data;
      console.error("Dodo SDK error creating one-time checkout:", sdkErr?.message ?? sdkErr, "providerBody:", providerBody);
      return NextResponse.json(
        {
          error: "Failed to create one-time checkout session",
          sdkError: String(sdkErr?.message ?? sdkErr),
          providerBody: providerBody ?? null,
          sentPayload: payload
        },
        { status: sdkErr?.status ?? 422 }
      );
    }

    // Create a pending OneTimePurchase sentinel (non-fatal)
    try {
      const sentinel =
        checkoutResponse?.session_id ??
        checkoutResponse?.checkout_id ??
        checkoutResponse?.id ??
        `pending_${Date.now()}`;

      await db.oneTimePurchase.create({
        data: {
          userId: user.id,
          checkoutSessionId: String(sentinel),
          productId: String(productId),
          amount: 0,
          currency: "USD",
          status: "PENDING"
        }
      }).catch(() => {});
    } catch (e) {
      console.warn("Failed to create pending one-time purchase sentinel", e);
    }

    // Extract checkout URL for redirect
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
      return NextResponse.json(
        {
          error:
            "Checkout created but no redirect URL found in SDK response. Inspect sdkResponse.",
          sdkResponse: checkoutResponse
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl }, { status: 200 });
  } catch (err: any) {
    console.error("create-checkout (one-time) error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}