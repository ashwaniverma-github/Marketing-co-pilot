'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useSession } from 'next-auth/react';
import { Sparkles, X} from 'lucide-react';

// Default AI edit function with custom prompt support
export async function defaultAiEdit(content: string, customPrompt?: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content, 
        customPrompt 
      }),
    });

    if (!response.ok) {
      throw new Error('AI Edit failed');
    }

    const data = await response.json();
    return data.editedContent || content;
  } catch (error) {
    console.error('AI Edit error:', error);
    return content;
  }
}

interface TweetCardEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  onAiEdit?: (currentContent: string, customPrompt?: string) => Promise<string>;
}

// Helper function to convert markdown to HTML
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Convert __underline__ to <u>
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');
  
  // Convert [link text](url) to <a>
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // Convert line breaks to HTML
  // First, convert \n\n (double line breaks) to </p><p>
  html = html.replace(/\n\n+/g, '</p><p>');
  // Then, convert single \n to <br>
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already HTML
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}

// Helper function to convert HTML to plain text with line breaks preserved
function htmlToPlainText(html: string): string {
  if (!html) return '';
  
  let text = html;
  
  // Replace </p><p> with double line break
  text = text.replace(/<\/p>\s*<p>/gi, '\n\n');
  
  // Replace <br> with line break
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove all other HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  text = textarea.value;
  
  return text.trim();
}

// Export this function so you can use it when posting to X
export function convertHtmlToTweetText(html: string): string {
  return htmlToPlainText(html);
}

// Quick action suggestions
const quickActions = [
  { label: 'Make it engaging', prompt: 'Make this tweet more engaging and attention-grabbing' },
  { label: 'Use bullet points', prompt: 'Use bullet points in the tweet for better readable format , with a eye catching heading' },
  { label: 'Shorten it', prompt: 'Make this tweet more concise and punchy' },
  { label: 'Add CTA', prompt: 'Add a clear call-to-action at the end' },
  { label: 'Professional tone', prompt: 'Rewrite in a professional tone' },
  { label: 'Casual tone', prompt: 'Rewrite in a casual, friendly tone' },
];

export function TweetCardEditor({ 
  content, 
  onChange, 
  placeholder = "What's happening?", 
  maxLength = 280,
  className = "", 
  onAiEdit = defaultAiEdit
}: TweetCardEditorProps) {
  const { data: session } = useSession();
  const [charCount, setCharCount] = useState(0);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAiEdit = async (promptToUse?: string) => {
    if (!onAiEdit) return;

    try {
      setIsAiEditing(true);
      const plainText = htmlToPlainText(editor?.getHTML() || '');
      const finalPrompt = promptToUse || customPrompt.trim();
      
      const aiEditedContent = await onAiEdit(plainText, finalPrompt);
      const htmlContent = markdownToHtml(aiEditedContent);
      
      if (editor) {
        editor.commands.setContent(htmlContent);
        setCharCount(htmlToPlainText(htmlContent).length);
        onChange(htmlContent);
      }
      
      setCustomPrompt('');
      setShowAiPanel(false);
    } catch (error) {
      console.error('AI Edit failed:', error);
    } finally {
      setIsAiEditing(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleAiEdit(prompt);
  };
  
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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plainText = htmlToPlainText(html);
      setCharCount(plainText.length);
      onChange(html);
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      // Check if content is markdown or HTML
      const isHtml = content.trim().startsWith('<');
      const htmlContent = isHtml ? content : markdownToHtml(content);
      
      if (htmlContent !== editor.getHTML()) {
        editor.commands.setContent(htmlContent);
        setCharCount(htmlToPlainText(htmlContent).length);
      }
    }
  }, [content, editor]);

  // Check if user is X Premium
  const isXPremium = (session as any)?.xVerified;

  return (
    <div className="relative">
      <div className="bg-card border border-gray-300 rounded-xl w-full hover:shadow-sm transition-shadow">
        <div className="flex items-start space-x-3 p-2 sm:p-4">
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
            <div className="flex items-center space-x-2 mb-2 ">
              <span className="font-semibold text-foreground text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-full inline-block">
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
                className={`prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror-focused]:border-none [&_.ProseMirror-focused]:ring-0 [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:p-0 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline ${className}`}
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
              <div className="flex items-center space-x-2">
                {/* AI Edit Button */}
                {typeof onAiEdit === 'function' && (
                  <button 
                    onClick={() => setShowAiPanel(!showAiPanel)} 
                    disabled={isAiEditing}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      showAiPanel
                        ? ''
                        : 'hover:bg-cyan-950 hover:text-cyan-50'
                    } ${isAiEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAiEditing ? 'Editing...' : 'Edit'}</span>
                  </button>
                )}
                
                {/* Character Count */}
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
      </div>

      {/* AI Edit Panel */}
      {showAiPanel && (
        <div className="mt-3 bg-card border rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">Make it better</h3>
            </div>
            <button 
              onClick={() => setShowAiPanel(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isAiEditing}
                  className="px-3 py-1.5 rounded-full text-xs font-medium hover:bg-cyan-950 hover:text-cyan-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium block">
              Or write custom instructions:
            </label>
            <div className="relative">
              <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                placeholder="e.g., Make it funnier, Add statistics, Use storytelling..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-950 focus:border-transparent resize-none"
              />
            </div>
            <button 
              onClick={() => handleAiEdit()}
              disabled={isAiEditing || !customPrompt.trim()}
              className="w-full px-4 py-2.5 bg-cyan-950 text-cyan-50 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAiEditing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Editing...</span>
                </>
              ) : (
                <>
                  
                  <span>Apply Custom Edit</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}