'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PrivacyPolicyPage() {
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

      {/* Privacy Policy Content */}
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information I Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            I collect information you provide directly to me, such as when you create an account, use the AI chat, or contact me. This may include:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li>Email address</li>
            <li>Name</li>
            <li>Usage data and interactions with the service</li>
            <li>Payment information (processed through secure third-party services)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How I Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            I use the information I collect to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li>Provide, maintain, and improve the Indiegrowth service</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            I do not sell, trade, or rent your personal information to third parties. I may share information with:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li>Service providers who assist in operating the service</li>
            <li>Legal requirements (if compelled by law)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            I implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            I use cookies and similar tracking technologies to enhance user experience, analyze trends, and administer the service. You can control cookies through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li>Access the personal information I hold about you</li>
            <li>Request correction of your personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            I may update this privacy policy from time to time. I will notify you of any changes by posting the new policy on this page.
          </p>
        </section>
      </div>
    </div>
  );
}
