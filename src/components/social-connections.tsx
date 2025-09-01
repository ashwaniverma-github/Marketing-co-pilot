'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { TwitterIcon } from '@/components/icons';
import {
  Linkedin,
  Globe,
  Check,
  AlertCircle,
  Settings,
  Unlink,
  RefreshCw
} from 'lucide-react';
import type { SVGProps } from 'react';

interface SocialAccount {
  id: string;
  platform: 'twitter' | 'linkedin' | 'reddit';
  username: string;
  displayName: string;
  connected: boolean;
  verified: boolean;
  lastSync?: Date;
  avatar?: string;
}

interface SocialConnectionsProps {
  onConnect: (platform: string) => void;
  onDisconnect: (accountId: string) => void;
  onRefresh: (accountId: string) => void;
}

export function SocialConnections({ onConnect, onDisconnect, onRefresh }: SocialConnectionsProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { data: session } = useSession();
  const hasTwitterConnected = Boolean(session?.hasTwitter) || session?.provider === 'twitter';

  useEffect(() => {
    // Load connected accounts from localStorage or API
    const savedAccounts = localStorage.getItem('socialAccounts');
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }

    // Handle OAuth callback from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const twitterAuth = urlParams.get('twitter_auth');
    const twitterData = urlParams.get('twitter_data');

    if (twitterAuth === 'success' && twitterData) {
      try {
        const userData = JSON.parse(twitterData);
        const newAccount: SocialAccount = {
          id: Date.now().toString(),
          platform: 'twitter',
          username: `@${userData.username}`,
          displayName: userData.name,
          connected: true,
          verified: userData.verified,
          lastSync: new Date(),
          avatar: userData.profile_image_url
        };

        const existingAccounts = accounts.filter(acc => acc.platform !== 'twitter');
        const updatedAccounts = [...existingAccounts, newAccount];
        setAccounts(updatedAccounts);
        localStorage.setItem('socialAccounts', JSON.stringify(updatedAccounts));
        
        // Store access token separately (in production, use secure storage)
        localStorage.setItem('twitter_access_token', userData.accessToken);
        
        onConnect('twitter');

        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (error) {
        console.error('Failed to process Twitter OAuth callback:', error);
      }
    }
  }, [accounts, onConnect]);

  const handleConnect = async (platform: string) => {
    setIsConnecting(platform);
    
    try {
      if (platform === 'twitter') {
        // Use NextAuth to start Twitter OAuth
        await signIn('twitter', { callbackUrl: '/dashboard' });
      } else {
        // For other platforms, show coming soon message
        alert(`${platform} integration coming soon!`);
        setIsConnecting(null);
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      setIsConnecting(null);
    }
  };

  const handleDisconnect = (accountId: string) => {
    const updatedAccounts = accounts.filter(account => account.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('socialAccounts', JSON.stringify(updatedAccounts));
    onDisconnect(accountId);
  };

  const handleRefresh = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedAccounts = accounts.map(acc => 
        acc.id === accountId 
          ? { ...acc, lastSync: new Date() }
          : acc
      );
      setAccounts(updatedAccounts);
      localStorage.setItem('socialAccounts', JSON.stringify(updatedAccounts));
      onRefresh(accountId);
    } catch (error) {
      console.error('Failed to refresh account:', error);
    }
  };

  const XLogo = (props: SVGProps<SVGSVGElement>) => (
    <TwitterIcon {...props} />
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <XLogo className="w-5 h-5 text-foreground" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-600" />;
      case 'reddit':
        return <Globe className="w-5 h-5 text-orange-500" />;
      default:
        return <XLogo className="w-5 h-5 text-foreground" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'X (Twitter)';
      case 'linkedin':
        return 'LinkedIn';
      case 'reddit':
        return 'Reddit';
      default:
        return 'X (Twitter)';
    }
  };

  const platforms = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      description: 'Connect your X account to post tweets and threads directly.',
      icon: <XLogo className="w-6 h-6 text-foreground" />,
      available: true
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Share professional content and updates with your network.',
      icon: <Linkedin className="w-6 h-6 text-blue-600" />,
      available: false // Coming soon
    },
    {
      id: 'reddit',
      name: 'Reddit',
      description: 'Engage with communities and share your content.',
      icon: <Globe className="w-6 h-6 text-orange-500" />,
      available: false // Coming soon
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Social Media Connections</h3>
        <p className="text-muted-foreground">
          Connect your social media accounts to publish content directly from the platform.
        </p>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-foreground mb-4">Connected Accounts</h4>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="bg-card border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-foreground">{account.displayName}</h5>
                        {account.verified && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{account.username}</p>
                      {account.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {account.lastSync.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefresh(account.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Unlink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h4 className="text-md font-medium text-foreground mb-4">Available Platforms</h4>
        <div className="grid gap-4">
          {platforms.map((platform) => {
            const isConnected = accounts.some(acc => acc.platform === platform.id) || (platform.id === 'twitter' && hasTwitterConnected);
            const connecting = isConnecting === platform.id;
            
            return (
              <div key={platform.id} className="bg-card border rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{platform.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-foreground">{platform.name}</h5>
                        {isConnected && (
                          <span className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                            Connected
                          </span>
                        )}
                        {!platform.available && (
                          <span className="bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {platform.available ? (
                      isConnected ? (
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleConnect(platform.id)}
                          disabled={connecting}
                          size="sm"
                        >
                          {connecting ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      )
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Secure OAuth Authentication
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              We use secure OAuth protocols to connect your accounts. We never store your passwords 
              and you can revoke access at any time. Your account credentials remain secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
