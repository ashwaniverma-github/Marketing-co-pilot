'use client';

import { signIn } from 'next-auth/react';
import { TwitterIcon } from './icons';
import { CloseIcon } from './icons';
import posthog from 'posthog-js';

interface ConnectXModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectXModal({ isOpen, onClose }: ConnectXModalProps) {
  if (!isOpen) return null;

  const handleConnectX = () => {
    posthog.capture('cta_click', { cta: 'connect_x' });
    signIn('twitter', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Connect Your X Account</h2>
              <p className="text-muted-foreground mt-1">
                To publish content, you need to connect your X (Twitter) account
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TwitterIcon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Publishing Requires X Connection
            </h3>
            
            <p className="text-muted-foreground mb-6">
              You're currently signed in with Google. To post content directly to X, 
              you need to connect your X account with posting permissions.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleConnectX}
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 font-medium flex items-center justify-center space-x-2 transition-all"
              >
                <TwitterIcon className="w-5 h-5" />
                <span>Connect X Account</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-muted text-foreground py-3 px-4 rounded-lg hover:bg-muted/80 font-medium transition-all"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Secure OAuth:</strong> We use Twitter's official OAuth to connect your account. 
                Your credentials remain secure and you can revoke access anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
