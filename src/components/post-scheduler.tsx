'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  Twitter,
  Linkedin,
  Globe,
  Eye,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface Post {
  id: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'reddit';
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
  hashtags: string[];
  media?: string[];
}

interface PostSchedulerProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onPublish: (post: Post) => void;
  onToggleSchedule: (postId: string) => void;
}

export function PostScheduler({ posts, onEdit, onDelete, onPublish, onToggleSchedule }: PostSchedulerProps) {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'draft' | 'published'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-500" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'reddit':
        return <Globe className="w-4 h-4 text-orange-500" />;
      default:
        return <Twitter className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300';
    }
  };

  const filteredPosts = posts.filter(post => {
    // Status filter
    if (filter !== 'all' && post.status !== filter) return false;
    
    // Time filter
    if (timeFilter !== 'all' && post.scheduledAt) {
      const now = new Date();
      const postDate = new Date(post.scheduledAt);
      
      switch (timeFilter) {
        case 'today':
          return format(postDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        case 'week':
          return isAfter(postDate, now) && isBefore(postDate, addDays(now, 7));
        case 'month':
          return isAfter(postDate, now) && isBefore(postDate, addDays(now, 30));
        default:
          return true;
      }
    }
    
    return true;
  });

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-foreground">{posts.length}</p>
              <p className="text-muted-foreground text-sm">Total Posts</p>
            </div>
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-foreground">{scheduledCount}</p>
              <p className="text-muted-foreground text-sm">Scheduled</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-foreground">{draftCount}</p>
              <p className="text-muted-foreground text-sm">Drafts</p>
            </div>
            <Edit className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-foreground">{publishedCount}</p>
              <p className="text-muted-foreground text-sm">Published</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Posts</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">Time:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-1 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "Create your first post to get started." 
                : `No ${filter} posts match your current filters.`}
            </p>
          </div>
        ) : (
          filteredPosts
            .sort((a, b) => {
              if (a.scheduledAt && b.scheduledAt) {
                return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
              }
              if (a.scheduledAt) return -1;
              if (b.scheduledAt) return 1;
              return 0;
            })
            .map((post) => (
              <div key={post.id} className="bg-card rounded-xl border hover:shadow-lg transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getPlatformIcon(post.platform)}
                        <span className="text-sm font-medium text-foreground capitalize">
                          {post.platform === 'twitter' ? 'X (Twitter)' : post.platform}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        {post.scheduledAt && (
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">
                              {format(new Date(post.scheduledAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div 
                        className="text-foreground mb-3 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.hashtags.map((hashtag) => (
                            <span
                              key={hashtag}
                              className="inline-flex items-center bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs"
                            >
                              #{hashtag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(post)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {post.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onPublish(post)}>
                            <Play className="w-4 h-4 mr-2" />
                            Publish Now
                          </DropdownMenuItem>
                        )}
                        {post.status === 'scheduled' && (
                          <DropdownMenuItem onClick={() => onToggleSchedule(post.id)}>
                            <Pause className="w-4 h-4 mr-2" />
                            Unschedule
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onDelete(post.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
