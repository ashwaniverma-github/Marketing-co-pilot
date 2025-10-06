'use client'
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu , X } from 'lucide-react';
import posthog from 'posthog-js';
export default function LandingNavbar(){
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
        <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50 border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground text-xl font-mono">Indiegrowth</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="/about" className="text-muted-foreground hover:text-foreground">About</a>
            <a href="/pricing" onClick={() => posthog.capture('cta_click', { cta: 'nav_pricing' })} className="text-muted-foreground font-semibold hover:text-foreground">Pricing</a>
            
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <a 
              href={session ? "/dashboard" : "/login"} 
              onClick={() => posthog.capture('cta_click', { cta: 'nav_get_started' })} 
              className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold"
            >
              {session ? "Dashboard" : "Get Started"}
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
              <a href={session ? "/dashboard" : "/login"} className="bg-foreground text-background px-6 py-2 rounded-full">
                {session ? "Dashboard" : "Get Started"}
              </a>
              <div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
    )
}