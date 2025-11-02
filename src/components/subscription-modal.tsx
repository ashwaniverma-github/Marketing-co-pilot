'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Local product shape from /api/dodo/products
type Product = {
  product_id: string | number;
  is_recurring?: boolean;
  name?: string;
  description?: string;
  price?: number;
};
export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeUsageCount?: number;
}

export function SubscriptionModal({ 
  isOpen, 
  onClose, 
  freeUsageCount = 0 
}: SubscriptionModalProps) {
  const { data: session } = useSession();
  const [checkoutType, setCheckoutType] = useState<'none' | 'subscription' | 'one-time'>('none');

  // Check if user is already on PRO plan
  const isProUser = session?.user && 
    ((session.user as any).plan === 'PRO' || 
     (session.user as any).hasActiveSubscription);

  // If user is already PRO, close the modal immediately
  useEffect(() => {
    if (isProUser && isOpen) {
      onClose();
    }
  }, [isProUser, isOpen, onClose]);

  // If user is already PRO, don't render the modal
  if (isProUser) {
    return null;
  }

  async function handleSubscriptionCheckout() {
    setCheckoutType('subscription');
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

      // Find the first subscription product
      const subscriptionProduct = Array.isArray(products)
        ? products.find((product: Product) => product?.is_recurring === true)
        : undefined;

      if (!subscriptionProduct) {
        throw new Error("No subscription product found");
      }

      const productId = subscriptionProduct.product_id;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/checkout/subscription?productId=${encodeURIComponent(String(productId))}`, {
        method: "GET",
        credentials: "include", // ensure cookies are sent
        headers: { "Accept": "application/json" }
      });
  
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
        alert(body?.error ? `Checkout failed: ${body.error}` : "Checkout failed. Please try again or contact support.");
        return;
      }
  
      const checkoutUrl = body.checkoutUrl;
      if (!checkoutUrl) {
        console.error("No checkout URL returned", body);
        alert("Unable to create checkout session. Please try again.");
        return;
      }
  
      // Redirect browser to provider checkout URL
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An unexpected error occurred. Please try again or contact support.");
    } finally {
      setCheckoutType('none');
    }
  }

  async function handleOneTimeCheckout() {
    setCheckoutType('one-time');
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
      
      // Find the first one-time product
      const oneTimeProduct = Array.isArray(products)
        ? products.find((product: Product) => product?.is_recurring === false)
        : undefined;
      
      if (!oneTimeProduct) {
        throw new Error("No one-time product found");
      }

      const productId = oneTimeProduct.product_id;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/checkout/one-time?productId=${encodeURIComponent(String(productId))}`, {
        method: "GET",
        credentials: "include", // ensure cookies are sent
        headers: { "Accept": "application/json" }
      });
  
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
        alert(body?.error ? `Checkout failed: ${body.error}` : "Checkout failed. Please try again or contact support.");
        return;
      }
  
      const checkoutUrl = body.checkoutUrl;
      if (!checkoutUrl) {
        console.error("No checkout URL returned", body);
        alert("Unable to create checkout session. Please try again.");
        return;
      }
  
      // Redirect browser to provider checkout URL
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("One-time Checkout error:", error);
      alert("An unexpected error occurred. Please try again or contact support.");
    } finally {
      setCheckoutType('none');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-2xl shadow-2xl max-w-4xl w-full mx-4 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Choose Your Indiegrowth Pro Access
          </h2>
          <p className="text-muted-foreground mb-6">
            {freeUsageCount > 0 
              ? `You've used ${freeUsageCount} of your free AI chat sessions.` 
              : 'Unlock full potential of Indiegrowth'}
            {' '}Upgrade to continue enjoying unlimited AI assistance.
          </p>

          <div className="flex justify-center space-x-8">
            {/* Monthly Subscription Card */}
            <div className="w-full max-w-md bg-background border rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Monthly Subscription
              </h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$9</span>
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
              <h3 className="text-xl font-bold text-foreground mb-4">
                One-Time Access
              </h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$49</span>
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

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-border rounded-xl text-foreground hover:bg-muted font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
