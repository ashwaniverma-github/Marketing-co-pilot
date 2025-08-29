'use client';

import { useState, useEffect } from 'react';
import { RichTextEditor } from './ui/rich-text-editor';
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
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Post {
  id: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'reddit';
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
  hashtags: string[];
  media?: string[];
}

interface PostEditorProps {
  post?: Post;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  onPublish?: (post: Post) => void;
}

export function PostEditor({ post, isOpen, onClose, onSave, onPublish }: PostEditorProps) {
  const [content, setContent] = useState(post?.content || '');
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'reddit'>(post?.platform || 'twitter');
  const [hashtags, setHashtags] = useState<string[]>(post?.hashtags || []);
  const [newHashtag, setNewHashtag] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(post?.scheduledAt || null);
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>(post?.status || 'draft');

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setPlatform(post.platform);
      setHashtags(post.hashtags);
      setScheduledAt(post.scheduledAt || null);
      setStatus(post.status);
    }
  }, [post]);

  const handleSave = () => {
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
    try {
      // Post to social media
      const response = await fetch('/api/post-to-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post');
      }

      const updatedPost: Post = {
        id: post?.id || Date.now().toString(),
        content,
        platform,
        hashtags,
        status: 'published',
      };
      
      onPublish?.(updatedPost);
      onClose();
      
      // Show success message
      alert(`Successfully posted to ${platform === 'twitter' ? 'X' : platform}!`);
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert(`Failed to post to ${platform === 'twitter' ? 'X' : platform}. Please try again.`);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) return;
    
    try {
      // Schedule the post
      const response = await fetch('/api/post-to-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          content,
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
      
      // Show success message
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
    <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {post ? 'Edit Post' : 'Create New Post'}
              </h2>
              <p className="text-muted-foreground mt-1">
                Create engaging content for your social media platforms
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Platform</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={getPlatformColor(platform)}>
                      {getPlatformIcon(platform)}
                    </span>
                    <span>{getPlatformName(platform)}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setPlatform('twitter')}>
                  <div className="flex items-center space-x-2">
                    <Twitter className="w-4 h-4 text-blue-500" />
                    <span>X (Twitter)</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlatform('linkedin')}>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlatform('reddit')}>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-orange-500" />
                    <span>Reddit</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Content</label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              platform={platform}
              maxLength={getCharacterLimit(platform)}
              placeholder={
                platform === 'twitter' 
                  ? "What's happening?" 
                  : platform === 'linkedin'
                  ? "Share an update..."
                  : "Share your thoughts..."
              }
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Hashtags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {hashtags.map((hashtag) => (
                <span
                  key={hashtag}
                  className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                >
                  <Hash className="w-3 h-3" />
                  <span>{hashtag}</span>
                  <button
                    onClick={() => removeHashtag(hashtag)}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                placeholder="Add hashtag..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <Button onClick={addHashtag} variant="outline">
                <Hash className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Schedule</label>
            <div className="flex items-center space-x-3">
              <Button
                variant={scheduledAt ? "outline" : "default"}
                onClick={() => setScheduledAt(null)}
              >
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
              <Button
                variant={scheduledAt ? "default" : "outline"}
                onClick={() => setScheduledAt(new Date())}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
            
            {scheduledAt && (
              <div className="mt-4 p-4 bg-muted rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Schedule for:</span>
                  </div>
                  <DatePicker
                    selected={scheduledAt}
                    onChange={(date) => setScheduledAt(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              {scheduledAt ? (
                <Button onClick={handleSchedule}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              ) : (
                <Button onClick={handlePublish}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
