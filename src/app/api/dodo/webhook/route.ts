// app/api/dodo/webhook/route.ts
import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { getDodoPayments } from "@/lib/dodopayments";
import { db } from "@/lib/db";

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);

function safeDate(dateLike: any): Date | null {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

async function sendAdminAlert(payload: any) {
  const url = process.env.ADMIN_WEBHOOK_URL;
  if (!url) {
    console.error("ADMIN_WEBHOOK_URL not configured — cannot send admin alert", { payload });
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "dodo-payments-webhook",
        receivedAt: new Date().toISOString(),
        payload
      })
    });
  } catch (err) {
    console.error("Failed to send admin alert", err);
  }
}

async function findUserForCustomerAndMetadata(customer: any, metadata: any) {
  // 1) metadata.userId
  if (metadata?.userId) {
    try {
      const u = await db.user.findUnique({
        where: { id: metadata.userId },
        include: { subscription: true }
      });
      if (u) return u;
    } catch (e) {}
  }

  // 2) customer.customer_id -> subscription.dodoCustomerId
  if (customer?.customer_id) {
    try {
      const u = await db.user.findFirst({
        where: {
          subscription: {
            dodoCustomerId: customer.customer_id
          }
        },
        include: { subscription: true }
      });
      if (u) return u;
    } catch (e) {}
  }

  // 3) email (case-insensitive)
  const custEmail = customer?.email ? customer.email.toString().toLowerCase() : null;
  if (custEmail) {
    try {
      const u = await db.user.findFirst({
        where: {
          email: { equals: custEmail, mode: "insensitive" }
        },
        include: { subscription: true }
      });
      if (u) return u;
    } catch (e) {
      // fallback
      try {
        const u2 = await db.user.findUnique({ where: { email: custEmail }, include: { subscription: true } });
        if (u2) return u2;
      } catch (_) {}
    }
  }

  return null;
}

export async function POST(request: Request) {
  const headersList = await headers();
  const dodopayments = getDodoPayments();

  try {
    const rawBody = await request.text();

    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || ""
    };

    await webhook.verify(rawBody, webhookHeaders);
    const payload = JSON.parse(rawBody);

    if (payload.data?.payload_type === "Subscription") {
      switch (payload.type) {
        case "subscription.active": {
          const subscription = await dodopayments.subscriptions.retrieve(payload.data.subscription_id);
          console.log("-------SUBSCRIPTION DATA START ---------");
          console.log(subscription);
          console.log("-------SUBSCRIPTION DATA END ---------");

          const customer = subscription.customer || {};
          const metadata = subscription.metadata || {};

          const user = await findUserForCustomerAndMetadata(customer, metadata);

          if (!user) {
            console.error("No user found for subscription.active", {
              subscription_id: subscription.subscription_id,
              customer,
              metadata
            });
            await sendAdminAlert({ event: "subscription.active.unlinked", subscription });
            break;
          }

          let tier: "FREE" | "BASIC" | "PRO" | "ENTERPRISE" = "PRO";
          if (subscription.product_id) {
            // TODO: map product ids -> tiers
            tier = "PRO";
          }

          await db.subscription.upsert({
            where: { userId: user.id },
            update: {
              status: subscription.status === "active" ? "ACTIVE" : "INACTIVE",
              tier,
              dodoCustomerId: customer.customer_id,
              dodoSubscriptionId: subscription.subscription_id,
              currentPeriodStart: safeDate(subscription.previous_billing_date),
              currentPeriodEnd: safeDate(subscription.next_billing_date),
              cancelAtPeriodEnd: !!subscription.cancel_at_next_billing_date,
              canceledAt: safeDate(subscription.cancelled_at)
            },
            create: {
              userId: user.id,
              status: subscription.status === "active" ? "ACTIVE" : "INACTIVE",
              tier,
              dodoCustomerId: customer.customer_id,
              dodoSubscriptionId: subscription.subscription_id,
              startDate: safeDate(subscription.created_at) || new Date(),
              currentPeriodStart: safeDate(subscription.previous_billing_date),
              currentPeriodEnd: safeDate(subscription.next_billing_date),
              cancelAtPeriodEnd: !!subscription.cancel_at_next_billing_date,
              canceledAt: safeDate(subscription.cancelled_at)
            }
          });

          await db.user.update({ where: { id: user.id }, data: { plan: tier } }).catch(() => {});

          console.log(`Subscription processed for user ${user.id} (${user.email})`);
          break;
        }

        case "subscription.failed": {
          const subscription = await dodopayments.subscriptions.retrieve(payload.data.subscription_id);
          const customer = subscription.customer || {};
          const user = await findUserForCustomerAndMetadata(customer, subscription.metadata || {});
          if (!user) {
            console.error("subscription.failed: no user found", { subscription });
            await sendAdminAlert({ event: "subscription.failed.unlinked", subscription });
            break;
          }
          await db.subscription.update({ where: { userId: user.id }, data: { status: "PAST_DUE" } }).catch(() => {});
          console.log(`Subscription failed for user ${user.id}`);
          break;
        }

        case "subscription.cancelled": {
          const subscription = await dodopayments.subscriptions.retrieve(payload.data.subscription_id);
          const customer = subscription.customer || {};
          const user = await findUserForCustomerAndMetadata(customer, subscription.metadata || {});
          if (!user) {
            console.error("subscription.cancelled: no user found", { subscription });
            await sendAdminAlert({ event: "subscription.cancelled.unlinked", subscription });
            break;
          }
          await db.subscription.update({
            where: { userId: user.id },
            data: { status: "CANCELED", canceledAt: new Date(), tier: "FREE" }
          }).catch(() => {});
          await db.user.update({ where: { id: user.id }, data: { plan: "FREE" } }).catch(() => {});
          console.log(`Subscription cancelled for user ${user.id}`);
          break;
        }

        default:
          console.log("Unhandled subscription event:", payload.type);
      }
    } else if (payload.data?.payload_type === "Payment") {
      switch (payload.type) {
        case "payment.succeeded": {
          // treat paymentData as any so we can access provider-specific fields safely
          const paymentData: any = await dodopayments.payments.retrieve(payload.data.payment_id);
          console.log("-------PAYMENT DATA START ---------");
          console.log(paymentData);
          console.log("-------PAYMENT DATA END ---------");

          const metadata = paymentData.metadata || {};
          const customer = paymentData.customer || {};

          // Find user (metadata -> dodoCustomerId -> email)
          const paymentUser = await findUserForCustomerAndMetadata(customer, metadata);

          if (!paymentUser) {
            console.error("No user found for payment.succeeded. Sending admin alert.", {
              paymentId: paymentData.payment_id,
              customer,
              metadata
            });
            await sendAdminAlert({ event: "payment.succeeded.unlinked", paymentData });
            break;
          }

          // Branch: One-time purchase flow
          if (metadata?.checkoutType === "one_time") {
            try {
              // Update latest pending OTP for this user, else create one
              const latestPending = await db.oneTimePurchase.findFirst({
                where: { userId: paymentUser.id, status: "PENDING" },
                orderBy: { createdAt: "desc" }
              });

              const amount = typeof paymentData.total_amount === "number" ? paymentData.total_amount : 0;
              const currency = paymentData.currency || "USD";
              const processedAt = paymentData.created_at ? new Date(paymentData.created_at) : new Date();

              if (latestPending) {
                await db.oneTimePurchase.update({
                  where: { id: latestPending.id },
                  data: {
                    dodoPaymentId: paymentData.payment_id,
                    amount,
                    currency,
                    status: "SUCCEEDED",
                    completedAt: processedAt
                  }
                });
              } else {
                await db.oneTimePurchase.create({
                  data: {
                    userId: paymentUser.id,
                    dodoPaymentId: paymentData.payment_id,
                    productId: metadata?.productId || "unknown",
                    amount,
                    currency,
                    status: "SUCCEEDED",
                    completedAt: processedAt
                  }
                });
              }

              // Also log into generic payments table (subscriptionId null for one-time)
              await db.payment.create({
                data: {
                  userId: paymentUser.id,
                  subscriptionId: null,
                  dodoPaymentId: paymentData.payment_id,
                  amount,
                  currency,
                  status: paymentData.status || "succeeded",
                  paymentMethod: paymentData.payment_method || null,
                  processedAt: processedAt
                }
              }).catch(() => {});

              // Update user plan to PRO for one-time purchase
              await db.user.update({ 
                where: { id: paymentUser.id }, 
                data: { 
                  plan: "PRO"
                } 
              }).catch(console.error);

            } catch (e) {
              console.error("Failed to persist one-time purchase success", e);
              await sendAdminAlert({ event: "one_time.persist.failed", error: String(e), paymentData });
            }
            break;
          }

          // Subscription flow (existing implementation)
          // compute start and end dates robustly
          const start = safeDate(paymentData.created_at) || new Date();

          // Try to get next_billing_date directly from paymentData (if present),
          // otherwise fetch subscription (if subscription_id exists) and use its next_billing_date.
          let nextBillingStr: string | undefined = undefined;
          if (typeof paymentData.next_billing_date === "string") {
            nextBillingStr = paymentData.next_billing_date;
          } else if (paymentData.subscription_id) {
            try {
              const subFromPayment: any = await dodopayments.subscriptions.retrieve(paymentData.subscription_id);
              if (subFromPayment?.next_billing_date) nextBillingStr = subFromPayment.next_billing_date;
            } catch (e) {
              // ignore - we'll fallback to 1 month default
            }
          }

          const end = safeDate(nextBillingStr) || (() => {
            const d = new Date(start);
            d.setMonth(d.getMonth() + 1);
            return d;
          })();

          // ensure subscription exists
          let userSubscription = paymentUser.subscription;
          if (!userSubscription) {
            userSubscription = await db.subscription.create({
              data: {
                userId: paymentUser.id,
                status: "ACTIVE",
                tier: "PRO",
                dodoCustomerId: customer.customer_id,
                dodoSubscriptionId: paymentData.subscription_id || undefined,
                startDate: start,
                currentPeriodStart: start,
                currentPeriodEnd: end
              }
            });
          } else {
            await db.subscription.update({
              where: { id: userSubscription.id },
              data: {
                status: "ACTIVE",
                dodoCustomerId: customer.customer_id || userSubscription.dodoCustomerId,
                dodoSubscriptionId: paymentData.subscription_id || userSubscription.dodoSubscriptionId,
                currentPeriodStart: start,
                currentPeriodEnd: end
              }
            }).catch(() => {});
          }

          // create payment record
          try {
            await db.payment.create({
              data: {
                userId: paymentUser.id,
                subscriptionId: userSubscription.id,
                dodoPaymentId: paymentData.payment_id,
                amount: typeof paymentData.total_amount === "number" ? paymentData.total_amount : 0,
                currency: paymentData.currency || "USD",
                status: paymentData.status || "succeeded",
                paymentMethod: paymentData.payment_method || null,
                processedAt: paymentData.created_at ? new Date(paymentData.created_at) : new Date()
              }
            });
            console.log(`Payment record created for user ${paymentUser.id}: ${paymentData.payment_id}`);
          } catch (err) {
            console.warn("Creating payment record failed (maybe duplicate).", err);
          }

          await db.user.update({ where: { id: paymentUser.id }, data: { plan: "PRO" } }).catch(() => {});

          break;
        }

        case "payment.failed": {
          try {
            const paymentData: any = await dodopayments.payments.retrieve(payload.data.payment_id);
            const metadata = paymentData.metadata || {};
            if (metadata?.checkoutType === "one_time") {
              // Update latest pending OTP to FAILED (or create record if none)
              const latestPending = await db.oneTimePurchase.findFirst({
                where: { userId: (await findUserForCustomerAndMetadata(paymentData.customer || {}, metadata))?.id ?? "" , status: "PENDING" },
                orderBy: { createdAt: "desc" }
              }).catch(() => null);

              const paymentUser = await findUserForCustomerAndMetadata(paymentData.customer || {}, metadata);
              if (paymentUser) {
                if (latestPending) {
                  await db.oneTimePurchase.update({
                    where: { id: latestPending.id },
                    data: {
                      dodoPaymentId: paymentData.payment_id,
                      status: "FAILED",
                      completedAt: new Date()
                    }
                  });
                } else {
                  await db.oneTimePurchase.create({
                    data: {
                      userId: paymentUser.id,
                      dodoPaymentId: paymentData.payment_id,
                      productId: metadata?.productId || "unknown",
                      amount: typeof paymentData.total_amount === "number" ? paymentData.total_amount : 0,
                      currency: paymentData.currency || "USD",
                      status: "FAILED",
                      completedAt: new Date()
                    }
                  });
                }
              }
            }
          } catch (e) {
            console.error("Failed to persist one-time purchase failure", e);
          }
          break;
        }

        case "payment.cancelled": {
          try {
            const paymentData: any = await dodopayments.payments.retrieve(payload.data.payment_id);
            const metadata = paymentData.metadata || {};
            if (metadata?.checkoutType === "one_time") {
              const paymentUser = await findUserForCustomerAndMetadata(paymentData.customer || {}, metadata);
              if (paymentUser) {
                const latestPending = await db.oneTimePurchase.findFirst({
                  where: { userId: paymentUser.id, status: "PENDING" },
                  orderBy: { createdAt: "desc" }
                }).catch(() => null);

                if (latestPending) {
                  await db.oneTimePurchase.update({
                    where: { id: latestPending.id },
                    data: {
                      dodoPaymentId: paymentData.payment_id,
                      status: "CANCELLED",
                      completedAt: new Date()
                    }
                  });
                } else {
                  await db.oneTimePurchase.create({
                    data: {
                      userId: paymentUser.id,
                      dodoPaymentId: paymentData.payment_id,
                      productId: metadata?.productId || "unknown",
                      amount: 0,
                      currency: "USD",
                      status: "CANCELLED",
                      completedAt: new Date()
                    }
                  });
                }
              }
            }
          } catch (e) {
            console.error("Failed to persist one-time purchase cancellation", e);
          }
          break;
        }

        default:
          console.log("Unhandled payment event:", payload.type);
      }
    } else {
      console.log("Unhandled payload type:", payload.data?.payload_type);
    }

    return new Response(JSON.stringify({ message: "Webhook processed successfully" }), { status: 200 });
  } catch (error: any) {
    console.error(" ----- webhook verification or processing failed -----");
    console.error(error);
    return new Response(JSON.stringify({ message: "Webhook verification failed", error: String(error) }), { status: 400 });
  }
}
