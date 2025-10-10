'use client';

import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { eventBus, EVENTS } from '@/lib/event-bus';
import { RichTextEditor } from './ui/rich-text-editor';
import { TweetCardEditor, convertHtmlToTweetText, defaultAiEdit } from './ui/tweet-card-editor';
import { Button } from './ui/button';
import {
  Calendar,
  Clock,
  X,
  Twitter,
  Linkedin,
  Image,
  Hash,
  Save,
  Send,
  ChevronDown,
  Globe,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SubscriptionModal } from './subscription-modal';
import { useSession } from 'next-auth/react';

interface Post {
  id: string;
  content: string;
  platform: 'twitter';
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
  hashtags: string[];
  media?: string[];
  platformPostId?: string;
}

interface PostEditorProps {
  post?: Post;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  onPublish?: (post: Post) => void;
  hasXConnection?: boolean;
  onShowConnectX?: () => void;
}

export function PostEditor({ post, isOpen, onClose, onSave, onPublish, hasXConnection, onShowConnectX }: PostEditorProps) {
  const { data: session } = useSession();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [content, setContent] = useState(post?.content || '');
  const [platform, setPlatform] = useState<'twitter'>(post?.platform || 'twitter');
  const [hashtags, setHashtags] = useState<string[]>(post?.hashtags || []);
  const [newHashtag, setNewHashtag] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(post?.scheduledAt || null);
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>(post?.status || 'draft');
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setPlatform(post.platform);
      setHashtags(post.hashtags);
      setScheduledAt(post.scheduledAt || null);
      setStatus(post.status);
    } else {
      setContent('');
      setPlatform('twitter');
      setHashtags([]);
      setScheduledAt(null);
      setStatus('draft');
    }
  }, [post]);

  useEffect(() => {
    if (!isOpen) {
      setToast(null);
      setIsPublishing(false);
      setIsLoadingContent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (post && isOpen) {
      setIsLoadingContent(true);
      setTimeout(() => {
        setContent(post.content);
        setPlatform(post.platform);
        setHashtags(post.hashtags);
        setScheduledAt(post.scheduledAt || null);
        setStatus(post.status);
        setIsLoadingContent(false);
      }, 100);
    }
  }, [post, isOpen]);

  const handleSave = () => {
    posthog.capture('post_saved', { scheduled: !!scheduledAt });
    const updatedPost: Post = {
      id: post?.id || Date.now().toString(),
      content,
      platform,
      hashtags,
      scheduledAt: scheduledAt || undefined,
      status: scheduledAt ? 'scheduled' : 'draft',
    };
    onSave(updatedPost);
    onClose();
  };

  const handlePublish = async () => {
    const hasActiveSubscription = (session as any)?.hasActiveSubscription;
    
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return;
    }

    if (!hasXConnection) {
      posthog.capture('connect_x_prompt_opened');
      onShowConnectX?.();
      return;
    }

    setIsPublishing(true);
    
    try {
      const tweetContent = platform === 'twitter' 
        ? convertHtmlToTweetText(content)
        : content;

      const response = await fetch('/api/post-to-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          content: tweetContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsAuth) {
          onShowConnectX?.();
          return;
        }
        throw new Error(result.error || 'Failed to post');
      }

      const tweetId: string | undefined = result?.post?.data?.id;
      posthog.capture('post_published', { platform, hasTweetId: !!tweetId });

      const updatedPost: Post = {
        id: post?.id || Date.now().toString(),
        content,
        platform,
        hashtags,
        status: 'published',
        platformPostId: tweetId,
      };
      
      onPublish?.(updatedPost);
      
      eventBus.emit(EVENTS.TWEET_POSTED, content);
      
      setToast({ type: 'success', message: 'Successfully posted on X!' });
      
      setTimeout(() => {
        onClose();
        setToast(null);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to publish post:', error);
      setToast({ type: 'error', message: `Failed to post on X. ${error instanceof Error ? error.message : 'Please try again.'}` });
      
      setTimeout(() => {
        setToast(null);
      }, 5000);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) return;
    
    try {
      const tweetContent = platform === 'twitter' 
        ? convertHtmlToTweetText(content)
        : content;

      const response = await fetch('/api/post-to-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          content: tweetContent,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule post');
      }

      const updatedPost: Post = {
        id: post?.id || Date.now().toString(),
        content,
        platform,
        hashtags,
        scheduledAt,
        status: 'scheduled',
      };
      
      onSave(updatedPost);
      onClose();
      
      alert(`Post scheduled for ${scheduledAt.toLocaleString()}!`);
    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert('Failed to schedule post. Please try again.');
    }
  };

  const addHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter(h => h !== hashtag));
  };

  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'reddit':
        return <Globe className="w-4 h-4" />;
      default:
        return <Twitter className="w-4 h-4" />;
    }
  };

  const getPlatformName = (platformType: string) => {
    switch (platformType) {
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

  const getPlatformColor = (platformType: string) => {
    switch (platformType) {
      case 'twitter':
        return 'text-blue-500';
      case 'linkedin':
        return 'text-blue-600';
      case 'reddit':
        return 'text-orange-500';
      default:
        return 'text-blue-500';
    }
  };

  const getCharacterLimit = (platformType: string) => {
    switch (platformType) {
      case 'twitter':
        return 280;
      case 'linkedin':
        return 3000;
      case 'reddit':
        return 40000;
      default:
        return 280;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground truncate">
                  {post ? 'Edit Post' : 'Create New Post'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  Create engaging content for your social media platforms
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 sm:mb-3">Platform</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={getPlatformColor(platform)}>
                        {getPlatformIcon(platform)}
                      </span>
                      <span className="text-sm sm:text-base">{getPlatformName(platform)}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setPlatform('twitter')}>
                    <div className="flex items-center space-x-2">
                      <span>X (Twitter)</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 sm:mb-3">Content</label>
              {isLoadingContent ? (
                <div className="border rounded-xl bg-muted p-6 sm:p-8 text-center min-h-[180px] flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-foreground border-t-transparent rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Loading content...</span>
                  </div>
                </div>
              ) : platform === 'twitter' ? (
                <TweetCardEditor
                  content={content}
                  onChange={setContent}
                  onAiEdit={defaultAiEdit}
                  maxLength={getCharacterLimit(platform)}
                  placeholder="What's happening?"
                />
              ) : (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  platform={platform}
                  maxLength={getCharacterLimit(platform)}
                  placeholder={
                    platform === 'linkedin'
                      ? "Share an update..."
                      : "Share your thoughts..."
                  }
                />
              )}
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 sm:mb-3">Hashtags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {hashtags.map((hashtag) => (
                  <span
                    key={hashtag}
                    className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                  >
                    <Hash className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{hashtag}</span>
                    <button
                      onClick={() => removeHashtag(hashtag)}
                      className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full p-0.5 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                  placeholder="Add hashtag..."
                  className="flex-1 px-3 py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <Button onClick={addHashtag} variant="outline" className="w-full sm:w-auto">
                  <Hash className="w-4 h-4 sm:mr-2" />
                  <span className="sm:inline hidden">Add</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 sm:p-6 border-t">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                <Button variant="outline" onClick={handleSave} className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">Save Draft</span>
                </Button>
                {scheduledAt ? (
                  <Button onClick={handleSchedule} className="w-full sm:w-auto">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Schedule Post</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className={`w-full sm:w-auto ${isPublishing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm sm:text-base">Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        <span className="text-sm sm:text-base">Publish Now</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {toast && (
          <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 p-3 sm:p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className="font-medium text-sm sm:text-base">{toast.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </>
  );
}