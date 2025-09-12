'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { PostEditor } from '@/components/post-editor';
import { PostScheduler } from '@/components/post-scheduler';
import { AiChat } from '@/components/ai-chat';
import { ConnectXModal } from '@/components/connect-x-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { Navbar } from '@/components/dashboard/Navbar';
import { Topbar } from '@/components/dashboard/Topbar';
import {
  ContentIcon,
  PlusIcon,
  SparklesIcon,
  TwitterIcon,
  CloseIcon
} from '@/components/icons';
import KnowledgeBase from '@/components/KnowledgeBase';

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
  platform: 'twitter';
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
  hashtags: string[];
  media?: string[];
  onPostSuccess?: () => void;
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
  // Define tab type to match components
  type TabId = 'Content' | 'Chat' | 'Knowledge base';
  const [activeTab, setActiveTab] = useState<TabId>('Content');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  
  // New post management state
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showConnectXModal, setShowConnectXModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
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
          platformPostId: (post as any).platformPostId,
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
      // Save once with whatever we have (including platformPostId if available)
      await handleSavePost({ ...post, status: 'published' });
      
      // Call onPostSuccess callback if it exists
      if (post.onPostSuccess && typeof post.onPostSuccess === 'function') {
        post.onPostSuccess();
      }
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post. Please try again.');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowPostEditor(true);
  };

  const handleDeletePost = (postId: string) => {
    // Set the post ID to delete and show the confirmation modal
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };
  
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      // Call DELETE endpoint to remove the post
      const response = await fetch(`/api/posts?id=${postToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }
      
      // Remove the post from local state
      setPosts(posts.filter(p => p.id !== postToDelete));
      
      console.log('Post deleted successfully');
      
      // Reset the postToDelete state
      setPostToDelete(null);
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



  const tabs = [
    { id: 'Content' as const, name: 'Content'},
    { id: 'Chat' as const, name: 'Chat'},
    { id: 'Knowledge base' as const, name: 'Knowledge base'},
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return TwitterIcon;
      default:
        return TwitterIcon;
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
      {/* Navbar Component */}
      <Navbar 
        products={products}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        setShowAddProductModal={setShowAddProductModal}
      />

      {/* Mobile Tabs Navigation removed - using unified sidebar for all devices */}

      {/* Topbar Component */}
      <Topbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      {/* Main Content */}
      <main className="transition-all duration-300 p-4 lg:p-1  max-w-6xl mx-auto">
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

              {activeTab === 'Knowledge base' && (
                <KnowledgeBase productId={selectedProduct.id} />
              )}

              {/* Tab Content */}
              {activeTab === 'Chat' && (
                <AiChat
                  productId={selectedProduct.id}
                  productName={selectedProduct.name}
                  productUrl={selectedProduct.url}
                  userProfile={{
                    name: session?.user?.name,
                    image: (session as any)?.xAvatar || session?.user?.image,
                    xUsername: (session as any)?.xUsername,
                    xVerified: (session as any)?.xVerified,
                  }}
                  onOpenEditor={(content, onPostSuccess) => {
                    // First close any existing editor to ensure clean state
                    setShowPostEditor(false);
                    setEditingPost(null);
                    
                    // Store callback for when post is successfully published
                    const postCallback = onPostSuccess;
                    
                    // Use setTimeout to ensure the close animation completes before opening with new content
                    setTimeout(() => {
                      setEditingPost({
                        id: Date.now().toString(),
                        content: content,
                        platform: 'twitter',
                        status: 'draft',
                        hashtags: [],
                        // Store callback in the post object to be used after successful publishing
                        onPostSuccess: postCallback
                      });
                      setShowPostEditor(true);
                    }, 150); // Small delay to ensure smooth transition
                  }}
                />
              )}

              {activeTab === 'Content' && (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="bg-card border rounded-xl p-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">X (Twitter) Connection</h3>
                        <p className="text-sm text-muted-foreground">
                          {(session as any)?.hasXConnection
                            ? 'Your X account is connected and ready for posting.' 
                            : 'Connect your X account to post tweets directly from the app.'}
                                </p>
                              </div>
                      <div>
                        {(session as any)?.hasXConnection ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
                      <button
                              onClick={() => signIn('twitter', { callbackUrl: '/dashboard' })}
                              className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Reconnect
                            </button>
                      </div>
                        ) : (
                      <button
                            onClick={() => signIn('twitter', { callbackUrl: '/dashboard' })}
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium flex items-center space-x-2 transition-all"
                          >
                            <TwitterIcon className="w-4 h-4" />
                            <span>Connect X Account</span>
                      </button>
                        )}
                    </div>
                  </div>
                </div>

                  {/* Content Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">Content Management</h3>
                      <p className="text-muted-foreground mt-1">Create, schedule, and manage posts</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingPost(null);
                        setShowPostEditor(true);
                      }}
                      className="bg-foreground text-background px-2 py-2.5 rounded-lg hover:bg-foreground/90 font-medium flex items-center space-x-2 transition-all"
                    >
                      
                      <span>New Post</span>
                    </button>
                  </div>

                    <PostScheduler
                      posts={posts}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onPublish={handlePublishPost}
                      onToggleSchedule={handleToggleSchedule}
                      hasXConnection={!!(session as any)?.hasXConnection}
                      onShowConnectX={() => setShowConnectXModal(true)}
                    />
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
        key={editingPost?.id || 'new-post'}
        post={editingPost || undefined}
        isOpen={showPostEditor}
        onClose={() => {
          setShowPostEditor(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        onPublish={handlePublishPost}
        hasXConnection={!!(session as any)?.hasXConnection}
        onShowConnectX={() => setShowConnectXModal(true)}
      />

      {/* Connect X Modal */}
      <ConnectXModal
        isOpen={showConnectXModal}
        onClose={() => setShowConnectXModal(false)}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post?"
        itemName={postToDelete ? posts.find(p => p.id === postToDelete)?.content.substring(0, 30) + '...' : ''}
      />
    </div>
  );
}