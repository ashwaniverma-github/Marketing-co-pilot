'use client'
import { useSession } from 'next-auth/react';
export default function CTAFooter() {
    const {data:session} = useSession()
    return (
      <div className="relative overflow-hidden m-2 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute rounded-4xl inset-0 bg-gradient-to-r from-cyan-400/20 to-cyan-600/20 animate-in pointer-events-none"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold  tracking-tight leading-tight 
              transform transition-all duration-700">
              Get started with<br />Indiegrowth
            </h1>
            
            <div className="flex flex-col items-center gap-4">
              <button className="
                bg-white text-cyan-700 
                hover:bg-cyan-50 
                font-semibold 
                px-16 py-4 
                rounded-full 
                text-lg 
                shadow-xl 
                transition-all 
                duration-300 
                hover:shadow-2xl 
                transform 
                hover:-translate-y-1 
                active:scale-100
                group
              ">
                <a href={session ? '/dashboard' : '/login'} className="block transition-all duration-1000 group-hover:scale-130">
                  {session?'Go to app':'Get started'}
                </a>
              </button>
              
              <p className="text-sm font-medium">
                Try for free, no credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }