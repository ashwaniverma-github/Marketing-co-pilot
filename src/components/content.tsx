'use client';

import { TwitterIcon } from './icons';
import { PostScheduler } from './post-scheduler';

export default function Content({ 
  session, 
  signIn, 
  posts, 
  handleEditPost, 
  handleDeletePost, 
  handlePublishPost, 
  handleToggleSchedule, 
  setShowPostEditor, 
  setEditingPost,
  setShowConnectXModal 
}: { 
  session: any, 
  signIn: any, 
  posts: any[], 
  handleEditPost: (post: any) => void, 
  handleDeletePost: (postId: string) => void, 
  handlePublishPost: (post: any) => void, 
  handleToggleSchedule: (postId: string) => void, 
  setShowPostEditor: (show: boolean) => void, 
  setEditingPost: (post: any) => void,
  setShowConnectXModal: (show: boolean) => void 
}) {
  return (
    <div className="space-y-6 sm:w-10/10.5 w-11/12 mx-auto relative h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide bg-background">
      {/* Connection Status */}
      <div className="bg-card border rounded-xl p-4 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">X (Twitter) Connection</h3>
            <p className="text-sm text-muted-foreground">
              {session?.hasXConnection
                ? 'Your X account is connected and ready for posting.' 
                : 'Connect your X account to post tweets directly from the app.'}
            </p>
          </div>
          <div>
            {session?.hasXConnection ? (
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
          <p className="text-muted-foreground mt-1">Create and manage posts</p>
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
        hasXConnection={!!session?.hasXConnection}
        onShowConnectX={() => setShowConnectXModal(true)}
      />
    </div>
  );
}   