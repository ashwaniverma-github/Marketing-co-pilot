"use client";
import {  useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MultipageNav from '@/components/dashboard/multipage-nav';


type Product = {
  product_id: string | number;
  name: string;
  description?: string;
  price?: number;
  is_recurring?: boolean;
};

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkoutType, setCheckoutType] = useState<'none' | 'subscription' | 'one-time'>('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  async function handleSubscriptionCheckout() {
    setCheckoutType('subscription');
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/products`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.error("Failed to fetch products", errBody);
        alert("Unable to load products for checkout.");
        return;
      }

      const products: Product[] = await response.json();
      console.log("products", products);

      const subscriptionProduct = Array.isArray(products)
        ? products.find(p => p?.is_recurring === true)
        : undefined;

      if (!subscriptionProduct) {
        console.error("No subscription product found", products);
        alert("Subscription plan is not available right now.");
        return;
      }

      const productId = subscriptionProduct.product_id;
      console.log("Selected subscription productId", productId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/checkout/subscription?productId=${encodeURIComponent(String(productId))}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Accept": "application/json" }
        }
      );

      // not authenticated server-side -> redirect to login on client
      if (res.status === 401) {
        const body = await res.json().catch(() => ({}));
        const loginUrl = body?.loginUrl ?? `/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
        window.location.href = loginUrl;
        return;
      }

      const body = await res.json();

      if (!res.ok) {
        console.error("Checkout creation failed", body);
        alert(body?.error ? `Checkout failed: ${body.error}` : "Checkout failed. See console.");
        return;
      }

      const checkoutUrl = body.checkoutUrl;
      if (!checkoutUrl) {
        console.error("No checkout URL returned", body);
        alert("No checkout URL returned by server. See console for details.");
        return;
      }

      // Redirect browser to provider checkout URL
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. See console for details.");
    } finally {
      setCheckoutType('none');
    }
  }
  
  async function handleOneTimeCheckout() {
    setCheckoutType('one-time')
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    try {
      // Fetch products and find one-time product
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/products`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.error("Failed to fetch products", errBody);
        alert("Unable to load products for checkout.");
        return;
      }

      const products: Product[] = await response.json();
      console.log("products", products);

      const oneTimeProduct = Array.isArray(products)
        ? products.find(p => p?.is_recurring === false)
        : undefined;

      if (!oneTimeProduct) {
        console.error("No one-time product found", products);
        alert("One-time plan is not available right now.");
        return;
      }

      const productId = oneTimeProduct.product_id;
      console.log("Selected one-time productId", productId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/checkout/one-time?productId=${encodeURIComponent(String(productId))}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Accept": "application/json" }
        }
      );

      // not authenticated server-side -> redirect to login on client
      if (res.status === 401) {
        const body = await res.json().catch(() => ({}));
        const loginUrl = body?.loginUrl ?? `/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
        window.location.href = loginUrl;
        return;
      }

      const body = await res.json();

      if (!res.ok) {
        console.error("One-time Checkout creation failed", body);
        alert(body?.error ? `Checkout failed: ${body.error}` : "Checkout failed. See console.");
        return;
      }

      const checkoutUrl = body.checkoutUrl;
      if (!checkoutUrl) {
        console.error("No checkout URL returned", body);
        alert("No checkout URL returned by server. See console for details.");
        return;
      }

      // Redirect browser to provider checkout URL
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("One-time Checkout error:", error);
      alert("Checkout failed. See console for details.");
    } finally {
      setCheckoutType('none')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <MultipageNav isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />

      {/* Pricing Hero */}
      <section className="pt-24 px-6 text-center space-y-4">
        <h1 className="text-4xl font-semibold text-foreground mb-6">
          Simple, Transparent Pricing
        </h1>

        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {/* Subscription Card */}
          <div className="w-full max-w-md bg-background border rounded-2xl p-6 shadow-lg">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Indiegrowth Pro
            </h2>
            <p className="text-muted-foreground mb-6">
              All-in-one AI growth platform for indie hackers to grow their app
            </p>
            
            <div className="mb-6">
              <span className="text-5xl font-bold text-foreground">$9</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>
            <ul className="mb-8 space-y-4 text-left">
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited AI chat sessions
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Tweet mode
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Rich text editor
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Knowledge base
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Post to X in one click
                </li>
              </ul>
            <button 
            data-ph-name= 'Start monthly subscription'
                onClick={handleSubscriptionCheckout}
                disabled={checkoutType !== 'none'}
                className="w-full px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 font-medium transition-all flex items-center justify-center space-x-2"
              >
                {checkoutType === 'subscription' ? (
                  <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full"></div>
                ) : (
                  <span>Start Monthly Subscription</span>
                )}
              </button>
          </div>

          {/* One-Time Purchase Card */}
          <div className="w-full max-w-md bg-background border rounded-2xl p-6 shadow-lg">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Lifetime Access
            </h2>
            <p className="text-muted-foreground mb-6">
              Get full access to Indiegrowth Pro features without a recurring subscription
            </p>
            
            <div className="mb-6">
              <span className="text-5xl font-bold text-foreground">$49</span>
              <span className="text-muted-foreground ml-2">/ one-time</span>
            </div>
            <ul className="mb-8 space-y-4 text-left">
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All Pro features included
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Lifetime access
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No recurring charges
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Future updates
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant access
                </li>
              </ul>
              <button
                data-ph-name = "One-time-payment" 
                onClick={handleOneTimeCheckout}
                disabled={checkoutType !== 'none'}
                className="w-full px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 font-medium transition-all flex items-center justify-center space-x-2"
              >
                {checkoutType === 'one-time' ? (
                  <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full"></div>
                ) : (
                  <span>Buy One-Time Access</span>
                )}
              </button>
          </div>
        </div>
      </section>
    </div>
  );
}