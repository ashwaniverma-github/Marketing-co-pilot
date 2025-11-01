import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";

export default function MultipageNav({ isMobileMenuOpen, toggleMobileMenu }: { isMobileMenuOpen: boolean, toggleMobileMenu: () => void }){
    return (
        <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50 border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground text-xl font-mono">Indiegrowth</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <Link href="/login" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className="text-foreground focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-background/95 backdrop-blur-md border-b border-border">
            <div className="flex flex-col items-center space-y-4 py-6 px-4">
              <Link 
                href="/" 
                className="text-muted-foreground hover:text-foreground"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link 
                href="/pricing" 
                className="text-muted-foreground hover:text-foreground"
                onClick={toggleMobileMenu}
              >
                Pricing
              </Link>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
              <Link 
                href="/login" 
                className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold"
                onClick={toggleMobileMenu}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    )
}