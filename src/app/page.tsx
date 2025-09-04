"use client";

import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function Home() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50  border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-orange-500 text-2xl">🔥</span>
            </div>
            <span className="font-bold text-foreground text-xl">Indiepost</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="/pricing" className="text-muted-foreground font-semibold hover:text-foreground">Pricing</a>
            
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <a href="/dashboard" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started for Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen px-6 flex items-center justify-center relative pt-24">
        <div className="max-w-4xl mx-auto text-center ">
          <h1 className="text-5xl font-serif md:text-6xl font-bold text-foreground leading-tight mb-6 max-w-3xl mx-auto">
            Built For Indie Hackers To Grow Their App <br />
            <span className="text-orange-500">On X</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Our AI understands your app and your audience, and generates fresh content for you to post on X.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-cyan-900 text-white px-8 py-4 rounded-full  font-semibold text-lg flex items-center">
              Get Started for Free
            </a>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 py-20 ">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-normal text-foreground mb-4">
              Just Give Us The Url Of Your App And We Will Handle The Rest
            </h2>
            <p className="text-xl text-muted-foreground">
              Our AI Handles Content , Marketing , Growth and More.
            </p>
          </div>

          <div className="w-full h-[625px] relative rounded-2xl">
            <Image 
              src={resolvedTheme === 'dark' ? "/landing-dark.png" : "/landing-light.png"}
              alt="Indiepost Content Creation Dashboard" 
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
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to grow your app ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of indie hackers who are growing their app with our AI.
          </p>
          <a href="/dashboard" className="inline-block bg-foreground text-background px-8 py-4 rounded-lg hover:bg-foreground/90 font-semibold text-lg">
            Get Started For Free <span className="ml-1">→</span>
          </a>
          <p className="text-muted-foreground mt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Pricing Section */}


      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
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
        </div>
      </footer>
    </div>
  );
}
