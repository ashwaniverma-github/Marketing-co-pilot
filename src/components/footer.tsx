import Link from "next/link"
export default function(){
    return (
        <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Indiegrowth</h3>
              <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Indiegrowth. All rights reserved.
            </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link></li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://twitter.com/ashwanivermax" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-foreground flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                        <path d="M18.901 1.153h3.68l-8.04 9.557L24 22.846h-7.406l-5.8-7.584-6.638 7.584H1.474l8.659-9.928L0 1.153h7.594l5.243 6.932L18.901 1.153zm-1.626 17.08h2.039L6.882 3.257H4.673l12.602 15.976z"/>
                      </svg>
                      Contact Founder
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
}