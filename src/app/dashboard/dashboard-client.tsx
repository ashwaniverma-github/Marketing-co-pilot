'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { PostEditor } from '@/components/post-editor';
import { PostScheduler } from '@/components/post-scheduler';
import { SocialConnections } from '@/components/social-connections';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { GrowthSuggestions } from '@/components/growth-suggestions';
import { ProductKnowledge } from '@/components/product-knowledge';
import { ScrapedDataViewer } from '@/components/scraped-data-viewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DashboardIcon,
  ContentIcon,
  AnalyticsIcon,
  SettingsIcon,
  PlusIcon,
  SparklesIcon,
  CloseIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  CheckIcon,
  CalendarIcon,
  LightbulbIcon,
  MailIcon,
  ImageIcon,
  TwitterIcon,
  LinkedInIcon,
  RedditIcon,
  MenuIcon,
  GlobeIcon
} from '@/components/icons';

interface Product {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  url: string;
  logoUrl?: string;
  category: string;
  stage: string;
  status: string;
  launchDate?: string;
  createdAt: string;
  updatedAt: string;
  knowledge?: any;
  stats?: {
    posts: number;
    campaigns: number;
    competitors?: number;
    audiences?: number;
  };
}

interface Post {
  id: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'reddit';
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
  hashtags: string[];
  media?: string[];
}

interface MarketingKit {
  id: string;
  productId: string;
  createdAt: string;
  socialPosts: {
    platform: string;
    content: string;
    hashtags: string[];
    charCount: number;
  }[];
  emailSnippets: {
    subject: string;
    content: string;
    type: string;
  }[];
  growthIdeas: {
    title: string;
    description: string;
    effort: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    category: string;
  }[];
  memes: {
    template: string;
    topText: string;
    bottomText: string;
    description: string;
  }[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { productUrl: string; productName: string; tagline?: string }) => void;
  isLoading?: boolean;
}

function AddProductModal({ isOpen, onClose, onSubmit, isLoading }: AddProductModalProps) {
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [tagline, setTagline] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { [key: string]: string } = {};
    
    if (!productUrl) {
      newErrors.productUrl = 'Product URL is required';
    } else if (!validateUrl(productUrl)) {
      newErrors.productUrl = 'Please enter a valid URL';
    }

    if (!productName) {
      newErrors.productName = 'Product name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ productUrl, productName, tagline });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Add New Product</h2>
              <p className="text-muted-foreground mt-1">
                We'll analyze your product and create tailored marketing content
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

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="productUrl" className="block text-sm font-medium text-foreground mb-2">
                Product URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="productUrl"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://your-product.com"
                className={`w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                  errors.productUrl ? 'border-red-500 bg-red-50 dark:bg-red-950/50' : 'border-border hover:border-border/80'
                }`}
              />
              {errors.productUrl && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.productUrl}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                We'll analyze your landing page to understand your product automatically
              </p>
            </div>

            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-foreground mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., TaskFlow Pro"
                className={`w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                  errors.productName ? 'border-red-500 bg-red-50 dark:bg-red-950/50' : 'border-border hover:border-border/80'
                }`}
              />
              {errors.productName && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.productName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-foreground mb-2">
                Tagline <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., The modern way to manage your tasks"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl hover:border-border/80 focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                A clear tagline helps us better understand your value proposition
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-border rounded-xl text-foreground hover:bg-muted font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const authLoading = status === 'loading';
  const isAuthenticated = !!session;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'analytics' | 'growth' | 'knowledge' | 'scraped-data' | 'settings'>('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [marketingKits, setMarketingKits] = useState<MarketingKit[]>([]);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [proTipDismissed, setProTipDismissed] = useState(false);
  
  // New post management state
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [contentView, setContentView] = useState<'kits' | 'posts' | 'connections'>('posts');
  
  // Loading states
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load apps when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadApps();
      loadPosts();
      
      // Load UI preferences from localStorage
      const savedSidebarState = localStorage.getItem('sidebarCollapsed');
      if (savedSidebarState) {
        setSidebarCollapsed(JSON.parse(savedSidebarState));
      }

      const savedProTipState = localStorage.getItem('proTipDismissed');
      if (savedProTipState) {
        setProTipDismissed(JSON.parse(savedProTipState));
      }
    }
  }, [isAuthenticated, user]);

  const loadApps = async () => {
    setIsLoadingApps(true);
    try {
      const response = await fetch('/api/apps');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.apps);
        setIsFirstTime(result.apps.length === 0);
        if (result.apps.length > 0) {
          setSelectedProduct(result.apps[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch('/api/posts?limit=100');
      const result = await response.json();
      
      if (result.success) {
        const postsWithDates = result.posts.map((post: any) => ({
          ...post,
          scheduledAt: post.scheduledFor ? new Date(post.scheduledFor) : undefined,
          platform: post.platform
        }));
        setPosts(postsWithDates);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    // Show add product modal only after apps have loaded and user has none
    if (!isLoadingApps && isFirstTime) {
      setShowAddProductModal(true);
    }
  }, [isLoadingApps, isFirstTime]);

  const handleAddProduct = async (data: { productUrl: string; productName: string; tagline?: string }) => {
    setIsAddingProduct(true);

    try {
      // Call the analyze-product endpoint which will scrape, analyze, and store the app
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUrl: data.productUrl,
          productName: data.productName,
          tagline: data.tagline,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze product');
      }

      // Show success message
      if (result.message) {
        console.log('Analysis result:', result.message);
      }

      // Reload apps to get fresh data including the new analyzed app
      await loadApps();
      
      setShowAddProductModal(false);
      setIsFirstTime(false);
      
      // Select the new product
      if (result.data?.app) {
        const newProduct = result.data.app;
        // Find the full product from the reloaded list
        const fullProduct = products.find(p => p.id === newProduct.id);
        if (fullProduct) {
          setSelectedProduct(fullProduct);
        } else {
          // If not found in the list yet, use the basic data
          setSelectedProduct({
            ...newProduct,
            status: newProduct.status || 'active',
            stats: { posts: 0, campaigns: 0 },
          });
        }
      }

      // Store analysis data in localStorage for immediate use
      if (result.data) {
        localStorage.setItem(`analysis_${result.data.app.id}`, JSON.stringify(result.data));
      }

    } catch (error) {
      console.error('Failed to analyze product:', error);
      alert(`Failed to analyze product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleGenerateKit = async () => {
    if (!selectedProduct) return;

    setIsGeneratingKit(true);

    try {
      const response = await fetch('/api/generate-kit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate kit');
      }

      const newKits = [...marketingKits, result.kit];
      setMarketingKits(newKits);
      localStorage.setItem('marketingKits', JSON.stringify(newKits));
      
      // Switch to content tab to show the new kit
      setActiveTab('content');
    } catch (error) {
      console.error('Failed to generate kit:', error);
      // Handle error - show error message
    } finally {
      setIsGeneratingKit(false);
    }
  };

  const getProductKits = (productId: string) => {
    return marketingKits.filter(kit => kit.productId === productId);
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const dismissProTip = () => {
    setProTipDismissed(true);
    localStorage.setItem('proTipDismissed', JSON.stringify(true));
  };

  // Post management functions
  const handleSavePost = async (post: Post) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: post.content,
          hashtags: post.hashtags,
          platform: post.platform.toUpperCase(),
          appId: selectedProduct?.id,
          scheduledFor: post.scheduledAt?.toISOString(),
          status: post.status.toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save post');
      }

      // Reload posts to get fresh data
      await loadPosts();
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post. Please try again.');
    }
  };

  const handlePublishPost = async (post: Post) => {
    try {
      // First save the post
      await handleSavePost({ ...post, status: 'published' });
      
      // In a real implementation, this would also trigger the actual posting to social media
      console.log('Publishing post:', post);
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post. Please try again.');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowPostEditor(true);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // In a real implementation, you'd have a DELETE endpoint
      // For now, we'll just reload the posts
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleToggleSchedule = async (postId: string) => {
    try {
      // In a real implementation, you'd have an UPDATE endpoint
      // For now, we'll just reload the posts
      await loadPosts();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      alert('Failed to update post schedule. Please try again.');
    }
  };

  const handleSocialConnect = (platform: string) => {
    console.log('Connected to:', platform);
    // In real implementation, handle OAuth flow
  };

  const handleSocialDisconnect = (accountId: string) => {
    console.log('Disconnected account:', accountId);
    // In real implementation, revoke tokens
  };

  const handleSocialRefresh = (accountId: string) => {
    console.log('Refreshed account:', accountId);
    // In real implementation, refresh tokens
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DashboardIcon },
    { id: 'content', name: 'Content', icon: ContentIcon },
    { id: 'analytics', name: 'Analytics', icon: AnalyticsIcon },
    { id: 'growth', name: 'Growth', icon: LightbulbIcon },
    { id: 'knowledge', name: 'Knowledge', icon: SparklesIcon },
    { id: 'scraped-data', name: 'Website Data', icon: GlobeIcon },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return TwitterIcon;
      case 'linkedin':
        return LinkedInIcon;
      case 'reddit':
        return RedditIcon;
      default:
        return ContentIcon;
    }
  };

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-foreground rounded-xl flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-background" />
          </div>
          <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Top Bar (contains sidebar toggle, product selector, theme + profile) */}
      <div className="bg-card border-b px-6 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle - Always Visible */}
            <button
              onClick={toggleSidebar}
              className="flex p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="font-bold text-foreground">Marketing Co-Pilot</span>
            
            {/* Product Selector - Only when products exist */}
            {products.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 bg-muted hover:bg-muted/80 border border-border rounded-lg px-3 py-2 transition-all min-w-[160px]">
                    <span className="font-medium text-foreground text-sm truncate">
                      {selectedProduct?.name}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {products.map((product) => (
                    <DropdownMenuItem
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="flex items-center justify-between px-3 py-2 cursor-pointer"
                    >
                      <span className="font-medium text-foreground truncate">{product.name}</span>
                      {selectedProduct?.id === product.id && (
                        <CheckIcon className="w-4 h-4 text-foreground flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span className="font-medium">Add Product</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Add Product Button - When no products */}
            {products.length === 0 && (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center space-x-2 bg-foreground text-background px-4 py-1.5 rounded-lg hover:bg-foreground/90 font-medium transition-all"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Your First Product</span>
              </button>
            )}
          </div>
          {/* Right actions: theme + profile */}
          <div className="hidden sm:flex items-center space-x-2">
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center text-background font-medium text-sm hover:bg-foreground/90 transition-all">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user.name}
                  </DropdownMenuItem>
                  {user.email && (
                    <DropdownMenuItem className="text-muted-foreground text-sm">
                      {user.email}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-600 dark:text-red-400">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation (sticky below unified bar) */}
      <div className="lg:hidden bg-card border-b sticky top-[3.5rem] z-20">
        <div className="flex overflow-x-auto px-4 py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar (fixed below unified bar) */}
      <aside className={`hidden lg:block fixed left-0 top-[4.1rem] bg-card border-r h-[calc(100vh-3.5rem)] z-30 overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-62'
      }`}>
        <nav className="p-4">
          <div className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg text-left font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={sidebarCollapsed ? tab.name : undefined}
                >
                  <Icon className={activeTab === tab.id ? 'w-5 h-5 text-background' : 'w-5 h-5'} />
                  {!sidebarCollapsed && <span>{tab.name}</span>}
                </button>
              );
            })}
          </div>

          {!sidebarCollapsed && !proTipDismissed && (
            <div className="mt-8 p-4 bg-muted rounded-xl border relative">
              <button
                onClick={dismissProTip}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all"
                title="Dismiss pro tip"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
              <h4 className="font-medium text-foreground mb-2 pr-6">Pro Tip</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Generate content kits weekly to maintain consistent marketing momentum.
              </p>
              <button className="text-sm font-medium text-primary hover:text-primary/80">
                Learn more →
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 p-4 lg:p-8 pt-8 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'
      }`}>
          {!selectedProduct ? (
            /* Empty State */
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-10 h-10 text-foreground" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground mb-3">
                Welcome to Marketing Co-Pilot
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Start by adding your first product. We'll analyze it and create custom marketing content automatically.
              </p>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="inline-flex items-center space-x-2 bg-foreground text-background px-6 py-3 rounded-lg hover:bg-foreground/90 font-medium transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Your First Product</span>
              </button>
            </div>
          ) : (
            /* Dashboard Content */
            <div>
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-foreground">{selectedProduct.name}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <a 
                        href={selectedProduct.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground flex items-center space-x-1 text-sm"
                      >
                        <span>{selectedProduct.url}</span>
                        <ExternalLinkIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-card p-6 rounded-xl border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <ContentIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">This Month</span>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{getProductKits(selectedProduct.id).length}</p>
                        <p className="text-muted-foreground text-sm mt-1">Content Kits</p>
                      </div>
                    </div>
                    
                    <div className="bg-card p-6 rounded-xl border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <CalendarIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Total</span>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{posts.filter((p: any) => p.app?.id === selectedProduct.id).length}</p>
                        <p className="text-muted-foreground text-sm mt-1">Posts Created</p>
                      </div>
                    </div>
                    
                    <div className="bg-card p-6 rounded-xl border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <LightbulbIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Total</span>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{getProductKits(selectedProduct.id).reduce((total, kit) => total + kit.growthIdeas.length, 0)}</p>
                        <p className="text-muted-foreground text-sm mt-1">Growth Ideas</p>
                      </div>
                    </div>
                    
                    <div className="bg-card p-6 rounded-xl border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Total</span>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{getProductKits(selectedProduct.id).reduce((total, kit) => total + kit.memes.length, 0)}</p>
                        <p className="text-muted-foreground text-sm mt-1">Memes</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-card rounded-2xl border">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                      {getProductKits(selectedProduct.id).length > 0 ? (
                        <div className="space-y-4">
                          {getProductKits(selectedProduct.id).slice(-3).reverse().map((kit) => (
                            <div key={kit.id} className="flex items-center space-x-4 p-4 bg-muted rounded-xl">
                              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="text-foreground font-medium">New marketing kit generated</p>
                                <p className="text-muted-foreground text-sm">
                                  {new Date(kit.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">{kit.socialPosts.length} posts</p>
                                <p className="text-sm text-muted-foreground">{kit.growthIdeas.length} ideas</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No activity yet. Generate your first kit to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-muted rounded-xl p-8 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Ready to create content?</h3>
                        <p className="text-muted-foreground">Generate a new marketing kit with fresh ideas for your product.</p>
                      </div>
                      <button
                        onClick={handleGenerateKit}
                        disabled={isGeneratingKit}
                        className="bg-foreground text-background px-6 py-3 rounded-lg hover:bg-foreground/90 disabled:opacity-50 font-medium flex items-center space-x-2 transition-all"
                      >
                        {isGeneratingKit ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-5 h-5" />
                            <span>Generate New Kit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">Content Management</h3>
                      <p className="text-muted-foreground mt-1">Create, edit, and schedule your social media content</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingPost(null);
                        setShowPostEditor(true);
                      }}
                      className="bg-foreground text-background px-5 py-2.5 rounded-lg hover:bg-foreground/90 font-medium flex items-center space-x-2 transition-all"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Create Post</span>
                    </button>
                  </div>

                  {/* Content Sub-Navigation */}
                  <div className="flex space-x-1 bg-muted p-1 rounded-xl">
                    <button
                      onClick={() => setContentView('posts')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        contentView === 'posts'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Posts & Scheduling
                    </button>
                    <button
                      onClick={() => setContentView('kits')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        contentView === 'kits'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Marketing Kits
                    </button>
                    <button
                      onClick={() => setContentView('connections')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        contentView === 'connections'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Social Connections
                    </button>
                  </div>

                  {/* Content Views */}
                  {contentView === 'posts' && (
                    <PostScheduler
                      posts={posts}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onPublish={handlePublishPost}
                      onToggleSchedule={handleToggleSchedule}
                    />
                  )}

                  {contentView === 'connections' && (
                    <SocialConnections
                      onConnect={handleSocialConnect}
                      onDisconnect={handleSocialDisconnect}
                      onRefresh={handleSocialRefresh}
                    />
                  )}

                  {contentView === 'kits' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">Marketing Kits</h4>
                          <p className="text-muted-foreground">AI-generated content collections for your product</p>
                        </div>
                        <button 
                          onClick={handleGenerateKit}
                          disabled={isGeneratingKit}
                          className="bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 disabled:opacity-50 font-medium flex items-center space-x-2 transition-all"
                        >
                          {isGeneratingKit ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="w-4 h-4" />
                              <span>Generate Kit</span>
                            </>
                          )}
                        </button>
                      </div>

                      {getProductKits(selectedProduct.id).length === 0 ? (
                        <div className="bg-card rounded-2xl border p-12">
                          <div className="text-center max-w-md mx-auto">
                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                              <SparklesIcon className="w-8 h-8 text-primary" />
                            </div>
                            <h4 className="text-xl font-semibold text-foreground mb-3">No marketing kits yet</h4>
                            <p className="text-muted-foreground mb-6">Generate your first AI-powered marketing kit. Each kit includes social posts, emails, memes, and growth ideas.</p>
                            <button 
                              onClick={handleGenerateKit}
                              disabled={isGeneratingKit}
                              className="bg-foreground text-background px-6 py-3 rounded-lg hover:bg-foreground/90 disabled:opacity-50 font-medium inline-flex items-center space-x-2"
                            >
                              <SparklesIcon className="w-5 h-5" />
                              <span>Generate Your First Kit</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {getProductKits(selectedProduct.id).map((kit) => (
                            <div key={kit.id} className="bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-lg font-semibold text-foreground">
                                      Marketing Kit #{kit.id.slice(-6)}
                                    </h4>
                                    <p className="text-muted-foreground text-sm mt-1">
                                      Generated on {new Date(kit.createdAt).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-muted font-medium text-sm transition-all">
                                      Edit Content
                                    </button>
                                    <button className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 font-medium text-sm transition-all">
                                      Import to Posts
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="p-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                  <div className="bg-muted rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <ContentIcon className="w-5 h-5 text-foreground" />
                                      <span className="text-2xl font-semibold text-foreground">{kit.socialPosts.length}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Social Posts</p>
                                  </div>
                                  <div className="bg-muted rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <MailIcon className="w-5 h-5 text-foreground" />
                                      <span className="text-2xl font-semibold text-foreground">{kit.emailSnippets.length}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Email Snippets</p>
                                  </div>
                                  <div className="bg-muted rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <ImageIcon className="w-5 h-5 text-foreground" />
                                      <span className="text-2xl font-semibold text-foreground">{kit.memes.length}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Memes</p>
                                  </div>
                                  <div className="bg-muted rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <LightbulbIcon className="w-5 h-5 text-foreground" />
                                      <span className="text-2xl font-semibold text-foreground">{kit.growthIdeas.length}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Growth Ideas</p>
                                  </div>
                                </div>

                                {/* Content Preview */}
                                <div className="space-y-4">
                                  <div>
                                    <h5 className="font-medium text-foreground mb-3 flex items-center">
                                      <ContentIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                      Latest Social Posts
                                    </h5>
                                    <div className="grid md:grid-cols-2 gap-3">
                                      {kit.socialPosts.slice(0, 2).map((post, index) => {
                                        const PlatformIcon = getPlatformIcon(post.platform);
                                        return (
                                          <div key={index} className="bg-muted rounded-xl p-4 border">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center space-x-2">
                                                <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">{post.platform}</span>
                                              </div>
                                              <span className="text-xs text-muted-foreground">{post.charCount} chars</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div>
                                    <h5 className="font-medium text-foreground mb-3 flex items-center">
                                      <LightbulbIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                      Top Growth Ideas
                                    </h5>
                                    <div className="bg-muted rounded-xl p-4 border">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h6 className="font-medium text-foreground">{kit.growthIdeas[0]?.title}</h6>
                                          <p className="text-sm text-muted-foreground mt-1">{kit.growthIdeas[0]?.description}</p>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                            kit.growthIdeas[0]?.effort === 'Low' ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300' :
                                            kit.growthIdeas[0]?.effort === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300' :
                                            'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                                          }`}>
                                            {kit.growthIdeas[0]?.effort} Effort
                                          </span>
                                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                            kit.growthIdeas[0]?.impact === 'High' ? 'bg-secondary text-foreground' :
                                            'bg-secondary text-secondary-foreground'
                                          }`}>
                                            {kit.growthIdeas[0]?.impact} Impact
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard />
              )}

              {activeTab === 'growth' && (
                <GrowthSuggestions />
              )}

              {activeTab === 'knowledge' && (
                <ProductKnowledge
                  productId={selectedProduct.id}
                  productName={selectedProduct.name}
                  productUrl={selectedProduct.url}
                  tagline=""
                />
              )}

              {activeTab === 'scraped-data' && (
                <ScrapedDataViewer
                  productId={selectedProduct.id}
                  productUrl={selectedProduct.url}
                />
              )}

              {activeTab === 'settings' && (
                <div className="bg-card rounded-2xl border p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-6">Product Settings</h3>
                  <div className="max-w-2xl space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Product Name</label>
                      <input
                        type="text"
                        value={selectedProduct.name}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl hover:border-border/80 focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Product URL</label>
                      <input
                        type="url"
                        value={selectedProduct.url}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl hover:border-border/80 focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="pt-4">
                      <button className="bg-foreground text-background px-6 py-3 rounded-lg hover:bg-foreground/90 font-medium transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
        isLoading={isAddingProduct}
      />

      {/* Post Editor Modal */}
      <PostEditor
        post={editingPost || undefined}
        isOpen={showPostEditor}
        onClose={() => {
          setShowPostEditor(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        onPublish={handlePublishPost}
      />
    </div>
  );
}