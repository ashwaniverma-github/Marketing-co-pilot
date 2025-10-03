'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import { useSession } from 'next-auth/react';

interface TweetCardEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function TweetCardEditor({ 
  content, 
  onChange, 
  placeholder = "What's happening?", 
  maxLength = 280,
  className = "" 
}: TweetCardEditorProps) {
  const { data: session } = useSession();
  const [charCount, setCharCount] = useState(0);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      // Remove the character limit configuration
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Use a simple character count method
      setCharCount(html.replace(/<[^>]*>/g, '').length);
      onChange(html);
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Check if user is X Premium
  const isXPremium = (session as any)?.xVerified;

  return (
    <div className="bg-card border border-gray-300 rounded-xl w-full hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-3 p-4">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {(session as any)?.xAvatar ? (
            <img 
              src={(session as any).xAvatar} 
              alt={session?.user?.name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-foreground flex items-center justify-center">
              <span className="text-background font-medium text-sm">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-foreground">
              {(session as any)?.xDisplayName || session?.user?.name || 'User'}
            </span>
            {(session as any)?.xVerified && (
              <span className="text-blue-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.818.915-3.474 2.25c-.415-.166-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.656 1.335 1.964 2.25 3.474 2.25s2.818-.915 3.474-2.25c.415.164.865.25 1.335.25 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                </svg>
              </span>
            )}
            
            <span className="text-muted-foreground text-sm">
              {(session as any)?.xUsername ? (
                <>@{(session as any).xUsername}</>
              ) : (
                <span className="text-muted-foreground/60">Connect X to customize</span>
              )}
            </span>
          </div>
          
          {/* Editor */}
          <div className="text-foreground min-h-[100px]">
            <EditorContent 
              editor={editor} 
              className={`prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror-focused]:border-none [&_.ProseMirror-focused]:ring-0 [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:p-0 ${className}`}
            />
          </div>
          
          {/* Character Counter and X Premium Warning */}
          <div className="mt-3 flex justify-between items-center">
            <div>
              {!isXPremium && charCount > 280 && (
                <div className="text-xs text-amber-500 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Tweets over 280 characters require X Premium</span>
                </div>
              )}
            </div>
            <div className={`text-xs font-medium ${
              charCount > 280 
                ? !isXPremium 
                  ? 'text-amber-500' 
                  : 'text-muted-foreground'
                : 'text-muted-foreground'
            }`}>
              {charCount} characters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
