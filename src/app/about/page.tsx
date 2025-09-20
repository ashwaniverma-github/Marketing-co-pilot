'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50 border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground text-xl font-mono">Indiegrowth</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <Link href="/login" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* About Page Content */}
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">About Indiegrowth</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Indiegrowth is dedicated to empowering indie developers and entrepreneurs by providing cutting-edge AI-driven tools to accelerate product growth, marketing, and user engagement.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What I Do</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li>AI-powered market research and insights</li>
            <li>Intelligent social media and marketing assistance</li>
            <li>Product positioning and growth strategies</li>
            <li>Personalized AI chat for product development</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Journey</h2>
          <p className="text-muted-foreground leading-relaxed">
            As a passionate developer and entrepreneur, I understand the challenges of building and growing independent products. I leverage the latest AI technologies to provide actionable insights and support for indie developers like myself.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="text-muted-foreground space-y-3">
            <p>
              Have questions or suggestions? Reach out to us:
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="mailto:indiegrowth.app@gmail.com" 
                className="text-primary hover:underline flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <span>indiegrowth.app@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://twitter.com/ashwanivermax" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M18.901 1.153h3.68l-8.04 9.557L24 22.846h-7.406l-5.8-7.584-6.638 7.584H1.474l8.659-9.928L0 1.153h7.594l5.243 6.932L18.901 1.153zm-1.626 17.08h2.039L6.882 3.257H4.673l12.602 15.976z"/>
                </svg>
                <span>DM @ashwanivermax</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
