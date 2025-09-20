"use client";

import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50 border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground text-xl font-mono">Indiegrowth</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="/about" className="text-muted-foreground hover:text-foreground">About</a>
            <a href="/pricing" className="text-muted-foreground font-semibold hover:text-foreground">Pricing</a>
            
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <a href="/login" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg">
            <div className="flex flex-col items-center py-4 space-y-4">
              <a href="#features" className="text-foreground">Features</a>
              <a href="/about" className="text-foreground">About</a>
              <a href="/pricing" className="text-foreground">Pricing</a>
              <a href="/login" className="bg-foreground text-background px-6 py-2 rounded-full">
                Get Started
              </a>
              <div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen px-6 flex items-center justify-center relative pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight mb-6 max-w-3xl mx-auto">
            Built For Indie Hackers To Grow Their App <br />
            <span className="text-orange-500"></span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Our AI understands your app and your audience, and helps you grow your app.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-cyan-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg flex items-center">
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-normal text-foreground mb-4">
              Just Give Us The Url Of Your App And We Will Handle The Rest
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              Our AI Handles Content, Marketing, Growth and More.
            </p>
          </div>

          <div className="w-full h-[300px] sm:h-[450px] md:h-[625px] relative rounded-2xl overflow-hidden shadow-lg">
            <video 
              className="absolute inset-0 w-full h-full object-cover"
              src="/IndieGrowth demo.mp4"
              // poster={resolvedTheme === 'dark' ? "/landing-dark.png" : "/landing-light.png"}
              controls
              preload="metadata"
            >
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to grow your app?
          </h2>
          {/* <p className="text-base sm:text-xl text-muted-foreground mb-8">
            Join thousands of indie hackers who are growing their app with our AI.
          </p> */}
          <a href="/login" className="inline-block bg-foreground text-background px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-foreground/90 font-semibold text-base sm:text-lg">
            Get Started<span className="ml-1">→</span>
          </a>
          {/* <p className="text-muted-foreground mt-4 text-sm sm:text-base">
            Just Signin and Start Growing Your App
          </p> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Powerful Features for Indie Developers
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Indiegrowth provides a comprehensive AI designed to accelerate your app's growth and marketing efforts.
            </p>
          </div>

          {/* Feature 1: AI Content Creation */}
          <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                AI Content Creation
              </h3>
              <p className="text-muted-foreground mb-6">
                Our AI create Tweets for your app and you can post them directly on X (Twitter)
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  You can create Tweets for your app
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Chat to the AI to get more ideas
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Interact with the Knowledge Base to train the AI
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-xl">
              <div className="w-full aspect-video">
                <Image 
                  src="/tweet-page.png"
                  alt="AI Content Creation Dashboard" 
                  layout="responsive"
                  width={1920} 
                  height={1080}
                  className="rounded-xl object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Feature 2: Content Management */}
          <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
            <div className="rounded-xl">
              <div className="w-full aspect-video">
                <Image 
                  src="/Content-management.png"
                  alt="Content Management Dashboard" 
                  layout="responsive"
                  width={1920} 
                  height={1080}
                  className="rounded-xl object-cover"
                  priority
                />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Content Management dashboard for X (Twitter)
              </h3>
              <p className="text-muted-foreground mb-6">
                You can create, manage posts for your app on X (Twitter)
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Write and manage posts for your app
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Content Management
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Knowledge Base */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Knowledge Base
              </h3>
              <p className="text-muted-foreground mb-6">
                Provide data to the AI to train it about your app and its features 
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  AI understands your app and its features
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Retention optimization
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-cyan-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Personalized growth recommendations
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-xl">
              <div className="w-full aspect-video">
                <Image 
                  src="/knowledge-base.png"
                  alt="Knowledge Base Dashboard" 
                  layout="responsive"
                  width={1920} 
                  height={1080}
                  className="rounded-xl object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 mt-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Indiegrowth</h3>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Indiegrowth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
