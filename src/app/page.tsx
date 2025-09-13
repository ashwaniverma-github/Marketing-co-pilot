"use client";

import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

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
            <a href="/pricing" className="text-muted-foreground font-semibold hover:text-foreground">Pricing</a>
            
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <a href="/dashboard" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started for Free
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
          <div className="md:hidden absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg">
            <div className="flex flex-col items-center space-y-4 py-6 px-4">
              <a 
                href="#features" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="/pricing" 
                className="text-muted-foreground font-semibold hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <a 
                  href="/dashboard" 
                  className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started for Free
                </a>
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
              Get Started for Free
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

          <div className="w-full h-[300px] sm:h-[450px] md:h-[625px] relative rounded-2xl">
            <Image 
              src={resolvedTheme === 'dark' ? "/landing-dark.png" : "/landing-light.png"}
              alt="Indiegrowth Content Creation Dashboard" 
              fill 
              className="object-cover rounded-2xl" 
              priority
            />
            <div className="absolute inset-0 rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to grow your app?
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-8">
            Join thousands of indie hackers who are growing their app with our AI.
          </p>
          <a href="/dashboard" className="inline-block bg-foreground text-background px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-foreground/90 font-semibold text-base sm:text-lg">
            Get Started For Free <span className="ml-1">→</span>
          </a>
          <p className="text-muted-foreground mt-4 text-sm sm:text-base">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground font-mono">Indiegrowth</span>
          </div>
          <div className="text-muted-foreground text-sm text-center sm:text-left">
            © 2024 <span className="font-mono">Indiegrowth</span>. Built for creators and makers.
          </div>
        </div>
      </footer>
    </div>
  );
}
