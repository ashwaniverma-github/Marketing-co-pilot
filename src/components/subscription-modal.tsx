'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function handleCheckout() {
    setIsCheckingOut(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/products`, {
        cache: 'no-store'
      });

      const products = await response.json();
      const productId = products.map((product:any)=> product.product_id);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/checkout/subscription?productId=${encodeURIComponent(productId)}`, {
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
      setIsCheckingOut(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Upgrade to Indiegrowth Pro
          </h2>
          <p className="text-muted-foreground mb-6">
            {freeUsageCount > 0 
              ? `You've used ${freeUsageCount} of your free AI chat sessions.` 
              : 'Unlock full potential of Indiegrowth'}
            {' '}Upgrade to continue enjoying unlimited AI assistance.
          </p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">$10</span>
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
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-border rounded-xl text-foreground hover:bg-muted font-medium transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 font-medium transition-all flex items-center space-x-2"
            >
              {isCheckingOut ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <span>Start Your Growth Journey</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
