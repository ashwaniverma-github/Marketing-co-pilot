'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TermsOfServicePage() {
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
            <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <Link href="/login" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Terms of Service Content */}
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using Indiegrowth, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            Indiegrowth provides AI-powered tools and services to help indie developers and entrepreneurs grow their products. The service includes market research, AI chat, and marketing assistance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You agree to provide accurate and current information</li>
            <li>You will not use the service for any illegal or unauthorized purpose</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content, features, and functionality are and will remain the exclusive property of Indiegrowth. Our service is protected by copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Indiegrowth is provided "as is" without any warranties. I am not liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Modifications to Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            I reserve the right to modify or discontinue the service at any time, with or without notice. I am not liable to you or any third party for any modification, suspension, or discontinuation of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms of Service are governed by the laws in effect in the jurisdiction where I reside, without regard to its conflict of law principles.
          </p>
        </section>
      </div>
    </div>
  );
}
