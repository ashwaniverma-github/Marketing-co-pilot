"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-orange-500 text-2xl">🔥</span>
            </div>
            <span className="font-bold text-foreground text-xl">Indiepost</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/pricing" className="text-foreground font-semibold">Pricing</Link>
            <Link href="/dashboard" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started
            </Link>
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
          <div className="absolute top-0 right-0 m-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
            Best Value
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Indiepost Pro
          </h2>
          <p className="text-muted-foreground mb-6">
            All-in-one AI growth platform for indie hackers
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
              Unlimited AI-Generated Tweets
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
              Post to Twitter Automatically 
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No Commitment, Cancel Anytime
            </li>
          </ul>
          <Link 
            href="/dashboard" 
            className="block w-full text-center bg-foreground text-background py-4 rounded-lg hover:bg-foreground/90 text-lg font-semibold"
          >
            Start Your Growth Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-orange-500 text-2xl">🔥</span>
            </div>
            <span className="font-bold text-foreground">Indiepost</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2024 Indiepost. Built for creators and makers.
          </div>
        </div>
      </footer>
    </div>
  );
}
