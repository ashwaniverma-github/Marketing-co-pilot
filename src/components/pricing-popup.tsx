"use client";
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


type Product = {
  product_id: number;
  name: string;
  description: string;
  price: number;
  is_recurring: boolean;
};

export default function PricingPopup() {
  const { data: session, status } = useSession();
  const router = useRouter();

  async function handleCheckout() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/products`, {
        cache: 'no-store'
      });

      const products = await response.json();
      console.log("products", products);
      
      const productId = products.map((product:any)=> product.product_id )

      console.log("productId", productId);

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
        // show user-friendly error (toast/modal) instead
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
    }
  }
  

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-foreground text-xl font-mono">Indiegrowth</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/pricing" className="text-foreground font-semibold">Pricing</Link>
            {session ? <button className="font-semibold"  onClick={() => signOut()}>Logout</button> : <button className="font-semibold" onClick={() => router.push('/login')}>Login</button>}
          </div>
        </div>
      </nav>

      {/* Pricing Hero */}
      <section className="pt-24 px-6 text-center space-y-4">
        <h1 className="text-4xl font-semibold text-foreground mb-6">
          Simple, Transparent Pricing
        </h1>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto bg-background border rounded-2xl p-6 shadow-lg">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Indiegrowth Pro
          </h2>
          <p className="text-muted-foreground mb-6">
            All-in-one AI growth platform for indie hackers to grow their app
          </p>
          
          <div className="mb-6">
            <span className="text-5xl font-bold text-foreground">$10</span>
            <span className="text-muted-foreground ml-2">/ month</span>
          </div>
          <ul className="mb-8 space-y-4 text-left">
            <li className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Tweet mode to generate tweets for your app
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Post to X in one click 
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Ask the AI anything about your app 
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
          </ul>
          <button 
            data-ph-name="Start Your Growth Journey"
            onClick={handleCheckout}
            className="block w-full text-center bg-foreground text-background py-4 rounded-lg hover:bg-foreground/90 text-lg font-semibold"
          >
            {status === "authenticated" ? "Start Your Growth Journey" : "Signin to buy"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground font-mono">Indiegrowth</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2025 <span className="font-mono">Indiegrowth</span>. Built to grow your app.
          </div>
        </div>
      </footer>
    </div>
  );
}