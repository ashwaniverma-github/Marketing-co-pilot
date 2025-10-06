'use client'
import { useState } from "react";
import { useSession } from 'next-auth/react';
export default function Hero(){
    const [isCopied, setIsCopied] = useState(false);
    const { data: session } = useSession();

    return (
        <section className="min-h-screen px-6 flex items-center justify-center relative pt-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Launch Offer Banner */}
          <div className=" dark:bg-orange-900/30 rounded-xl px-2 py-4 mb-8 max-w-2xl mx-auto flex items-center justify-center space-x-4">
            <span className="text-orange-800 dark:text-orange-200 font-bold text-sm sm:text-base">
              🚀 Launch Offer: 30% OFF for First 10 Members! Use code
            </span>
            <div 
              onClick={() => {
                navigator.clipboard.writeText('INDIEGROWTH22');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="cursor-pointer group relative m-2 flex-shrink-0"
            >
              <code className={`bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 px-2  rounded-md text-xs sm:text-sm font-mono group-hover:bg-orange-300 dark:group-hover:bg-orange-700 transition-colors duration-200 ${
                isCopied 
                  ? 'animate-pulse bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100' 
                  : ''
              }`}>
                INDIEGROWTH22
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {isCopied ? 'Copied!' : 'Copy'}
                </span>
              </code>
            </div>
          </div>
          <h1 className="text-4xl  sm:text-5xl md:text-6xl  font-sans text-foreground leading-tight mb-6 max-w-3xl mx-auto">
            Write tweets and contents that grows your app <br />
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Make it a habit to write tweets , contents and manage your app on indiegrowth using AI . Just get started and you will love it. 
          </p>
          <div className="flex justify-center space-x-4">
            <a href={session ? "/dashboard" : "/login"} className="bg-cyan-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg flex items-center">
              {session ? "Go to app" : "Get Started"}
            </a>
          </div>
          <h1 className='text-sm text-muted-foreground pt-2'>Start Free . No Credit Card Required</h1>
        </div>
      </section>
    )
}