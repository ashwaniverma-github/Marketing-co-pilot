'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from '@/components/icons';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTwitterLoading, setIsTwitterLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Demo login removed

  const handleTwitterLogin = async () => {
    setIsTwitterLoading(true);
    setError('');

    try {
      // Use the full URL to ensure proper redirect
      await signIn('twitter', {
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: true,
      });
    } catch (error) {
      console.error('Twitter login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to login with Twitter');
      setIsTwitterLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      await signIn('google', {
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: true,
      });
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to login with Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-foreground rounded-xl flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Launch Studio
          </h1>
          <p className="text-muted-foreground">
            Marketing platform for indie hackers
          </p>
        </div>

        <div className="bg-card rounded-2xl border p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Get Started
            </h2>
            <p className="text-muted-foreground text-sm">
              Continue with Google or Twitter to sign in
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Google OAuth Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading || isTwitterLoading}
            className="w-full cursor-pointer bg-white text-black border hover:bg-gray-50"
            size="lg"
          >
            {isGoogleLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.5-37-4.4-54.6H272v103.3h146.9c-6.4 34.6-25.6 63.9-54.6 83.5v69.3h88.2c51.6-47.5 80.9-117.6 80.9-201.5z"/>
                  <path fill="#34A853" d="M272 544.3c73.4 0 135-24.3 180-66l-88.2-69.3c-24.5 16.5-55.9 26-91.8 26-70.6 0-130.4-47.7-151.8-111.8H30.6v70.3c44.6 88.1 136.5 150.5 241.4 150.5z"/>
                  <path fill="#FBBC05" d="M120.2 322.9c-10.7-31.9-10.7-66.2 0-98.1v-70.3H30.6c-44 87.9-44 191 0 278.9l89.6-70.5z"/>
                  <path fill="#EA4335" d="M272 107.7c39.9-.6 78 14 107.1 41.4l80.2-80.2C404.1 23.3 341.8-.1 272 0 167.1 0 75.2 62.4 30.6 150.5l89.6 70.3C141.7 147.1 201.4 99.4 272 99.4z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Twitter OAuth Login */}
          <Button
            onClick={handleTwitterLogin}
            disabled={isTwitterLoading || isLoading}
            className="w-full bg-black cursor-pointer hover:bg-black-600 text-white"
            size="lg"
          >
            {isTwitterLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting to Twitter...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Continue with X (Twitter)
              </>
            )}
          </Button>

          {/* Demo login removed */}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Built for indie hackers who want to grow their apps on X (Twitter)
          </p>
        </div>
      </div>
    </div>
  );
}
