'use client'
import { useSession } from 'next-auth/react';
export default function CTA(){
    const {data:session} = useSession()
    return(
        <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to grow your app?
          </h2>
          {/* <p className="text-base sm:text-xl text-muted-foreground mb-8">
            Join thousands of indie hackers who are growing their app with our AI.
          </p> */}
          <a href={session ? "/dashboard" : "/login"} className="inline-block bg-foreground text-background px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-foreground/90 font-semibold text-base sm:text-lg">
            {session ? "Dashboard" : "Get Started"}<span className="ml-1">→</span>
          </a>
          {/* <p className="text-muted-foreground mt-4 text-sm sm:text-base">
            Just Signin and Start Growing Your App
          </p> */}
        </div>
      </section>
    )
}