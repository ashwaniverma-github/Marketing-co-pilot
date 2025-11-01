'use client';
import { useState } from 'react';
import MultipageNav from '@/components/dashboard/multipage-nav';

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
    <MultipageNav isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />

      {/* About Page Content */}
      <div className="container mx-auto px-4 py-24 max-w-4xl mt-16">
        <h1 className="text-4xl font-bold mb-8 text-foreground">About Indiegrowth</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Indiegrowth is dedicated to empowering indie developers and entrepreneurs by providing cutting-edge AI-driven tools to accelerate product growth, marketing, and user engagement  by writing better tweets.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What you can do with Indiegrowth</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li>Write tweets that resonates with your product</li>
            <li>Make it a habit and track your progress </li>
            <li>Write on your own then customize your tweets the way you want or generate one with AI </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Journey</h2>
          <p className="text-muted-foreground leading-relaxed">
            As a passionate developer and entrepreneur, I understand the challenges of writing better tweets and growing your app.
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
