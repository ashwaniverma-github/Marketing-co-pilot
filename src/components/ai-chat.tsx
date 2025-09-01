'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { TwitterIcon, CopyIcon, CheckIcon } from './icons';
import { Forward, Edit } from 'lucide-react';

interface AiChatProps {
  productId: string;
  productName: string;
  productUrl: string;
  userProfile?: {
    name?: string | null;
    image?: string | null;
    xUsername?: string | null;
    xVerified?: boolean;
  };
  onOpenEditor?: (content: string) => void;
}

type ChatRole = 'user' | 'assistant';
type ChatMessage = { role: ChatRole; content: string; isTweet?: boolean };

export function AiChat({ productId, productName, productUrl, userProfile, onOpenEditor }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tweetMode, setTweetMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debug: Log userProfile data
  useEffect(() => {
    console.log('AiChat userProfile received:', userProfile);
    console.log('userProfile.xUsername:', userProfile?.xUsername);
    console.log('userProfile.xVerified:', userProfile?.xVerified);
  }, [userProfile]);

  const send = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: 'user', content: input };
    const next: ChatMessage[] = [...messages, userMessage];
    setMessages(next);
    setInput('');
    setLoading(true);
    
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '160px';
    }
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          productName, 
          productUrl, 
          messages: next,
          tweetMode 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      
      if (tweetMode && data.reply.includes('---TWEET---')) {
        // Split multiple tweets and create separate messages
        const tweets = data.reply.split('---TWEET---').map((tweet: string) => tweet.trim()).filter(Boolean);
        const tweetMessages: ChatMessage[] = tweets.map((tweet: string) => ({
          role: 'assistant',
          content: tweet,
          isTweet: true
        }));
        setMessages([...next, ...tweetMessages]);
      } else {
        // For normal AI responses, use typing effect
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: String(data.reply ?? ''),
          isTweet: false
        };
        
        // Add the message to state first
        setMessages([...next, assistantMessage]);
        
        // Then start typing effect with a small delay for realism
        setTimeout(() => {
          typeMessage(String(data.reply ?? ''), () => {
            // Typing effect completed
          });
        }, 500);
      }
    } catch (e) {
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Sorry, something went wrong.' };
      setMessages([...next, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const detectTweetIntent = (text: string) => {
    const tweetKeywords = ['tweet', 'twitter', 'post', 'social media'];
    return tweetKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      // Reset to minimum height first to properly measure content
      textareaRef.current.style.height = '160px';
      
      // If there's no content, keep minimum height
      if (!input.trim()) {
        textareaRef.current.style.height = '160px';
        return;
      }
      
      // Calculate new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 400; // Maximum height before scrolling
      const minHeight = 160; // Minimum height (h-40)
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [input]);

  const formatContent = (content: string) => {
    // First handle markdown links [text](url)
    const processedContent = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      return `<LINK>${text}|${url}</LINK>`;
    });

    // Then handle **text** to bold
    const parts = processedContent.split(/(\*\*.*?\*\*|<LINK>.*?<\/LINK>)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
      } else if (part.startsWith('<LINK>') && part.endsWith('</LINK>')) {
        const linkContent = part.slice(6, -7); // Remove <LINK> and </LINK>
        const [text, url] = linkContent.split('|');
        return (
          <a 
            key={index} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {text}
          </a>
        );
      }
      return part;
    });
  };

  const handleCopyTweet = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

    const typeMessage = (message: string, callback: () => void) => {
    setIsTyping(true);
    setTypingMessage('');
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < message.length) {
        setTypingMessage(prev => prev + message[index]);
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTypingMessage('');
        callback();
      }
    }, 25); // Slightly faster for better UX
  };

  const TweetCard = ({ content, index }: { content: string; index?: number }) => (
    <div className="bg-card border border-gray-300 rounded-xl p-4 w-full hover:shadow-sm transition-shadow relative">
      <div className="flex items-start space-x-3 pt-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {userProfile?.image ? (
            <img 
              src={userProfile.image} 
              alt={userProfile.name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-foreground flex items-center justify-center">
              <span className="text-background font-medium text-sm">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-foreground">
                  {userProfile?.name || 'User'}
                </span>
                {userProfile?.xVerified && (
                  <span className="text-blue-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.818.915-3.474 2.25c-.415-.166-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.656 1.335 1.964 2.25 3.474 2.25s2.818-.915 3.474-2.25c.415.164.865.25 1.335.25 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                    </svg>
                  </span>
                )}
                
                <span className="text-muted-foreground text-sm">
                  {userProfile?.xUsername ? (
                    <>@{userProfile.xUsername}</>
                  ) : (
                    <span className="text-muted-foreground/60">Connect X to customize</span>
                  )}
                </span>
              </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleCopyTweet(content)}
                className="p-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors opacity-70 hover:opacity-100"
                title="Copy tweet"
              >
                <CopyIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => onOpenEditor?.(content)}
                className="px-3 py-1.5  rounded-lg transition-colors flex items-center space-x-2 transform"
                title="Open in Editor"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Edit</span>
              </button>
            </div>
          </div>
          <div className="text-foreground whitespace-pre-wrap break-words leading-relaxed">{formatContent(content)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="">
      <h3 className="text-2xl text-center font-semibold text-foreground mb-12">What's on your mind today ?</h3>
      
      {/* Messages Section - Above input (normal AI responses and all user messages) */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto mb-4">
        {messages.map((m, i) => {
          // Skip tweet messages as they're displayed below
          if (m.isTweet) return null;
          
          // Check if this is the most recent AI response and should show typing effect
          const isLatestAIResponse = m.role === 'assistant' && i === messages.length - 1 && !m.isTweet;
          const shouldShowTyping = isLatestAIResponse && isTyping;
          
          return (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-3 py-3 rounded-2xl  max-w-[80%] ${m.role === 'user' ? 'bg-foreground text-background' : ' text-foreground'}`}>
                <div className="whitespace-pre-wrap break-words">
                  {m.role === 'user' ? m.content : (
                    shouldShowTyping ? (
                      <span>
                        {typingMessage}
                        <span className="animate-pulse">|</span>
                      </span>
                    ) : (
                      formatContent(m.content)
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="text-left">
            <div className="inline-block px-3 py-2 rounded-lg border bg-muted text-foreground">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-foreground border-t-transparent rounded-full"></div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Typing indicator for normal AI responses */}
        {isTyping && !loading && (
          <div className="text-left">
            <div className="inline-block px-3 py-3 rounded-2xl border bg-muted text-foreground max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <div className="p-4">
          <div className="relative  ">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !loading) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Ask about ${productName}...`}
              className="w-full  min-h-40 pr-12 pl-4 py-3 bg-background border-2 border-cyan-950 rounded-2xl focus:outline-none focus:ring-0 focus:border-4 focus:border-cyan-950 focus:shadow-none transition-all resize-none"
              style={{ 
                outline: 'none', 
                boxShadow: 'none',
                borderColor: '#164e63',
                verticalAlign: 'middle',
                textAlign: 'start',
                paddingTop: '3.5rem',
                height: '160px'
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <Forward className="w-10 h-10 text-white bg-cyan-950 rounded-xl   p-2 font-bold" />
              )}
            </button>
          </div>
        </div>
        
        {/* Tweet Mode Toggle - Always visible */}
        <div className="px-4 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTweetMode(!tweetMode)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${
                tweetMode 
                  ? ' bg-cyan-950 text-white ' 
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              <TwitterIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Tweet Mode</span>
            </button>
            {tweetMode && (
              <span className="text-sm text-muted-foreground">Responses will be formatted as tweets</span>
            )}
          </div>
        </div>
      </div>

      {/* Tweet Cards Section - Below input (only tweet responses) */}
      {messages.filter(m => m.isTweet).length > 0 && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          
          {/* Group tweets by user query */}
          {(() => {
            const tweetMessages = messages.filter(m => m.isTweet);
            const groups: ChatMessage[][] = [];
            let currentGroup: ChatMessage[] = [];
            
            tweetMessages.forEach((tweet, i) => {
              currentGroup.push(tweet);
              // Check if this is the last tweet or if the next message would be from a new query
              const nextTweetIndex = messages.findIndex(m => m === tweet) + 1;
              const nextMessage = messages[nextTweetIndex];
              
              if (!nextMessage || nextMessage.role === 'user' || currentGroup.length >= 4) {
                groups.push([...currentGroup]);
                currentGroup = [];
              }
            });
            
            return groups.map((tweetGroup, groupIndex) => (
              <div key={`tweet-group-${groupIndex}`} className="space-y-4">
                {tweetGroup.length > 1 && (
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <TwitterIcon className="w-5 h-5" />
                    <h4 className="text-lg font-semibold text-foreground">
                      Choose your favorite tweet
                    </h4>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tweetGroup.map((tweet, tweetIndex) => (
                    <TweetCard 
                      key={`tweet-${groupIndex}-${tweetIndex}`} 
                      content={tweet.content} 
                      index={tweetGroup.length > 1 ? tweetIndex : undefined}
                    />
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg transition-all z-50">
          <div className="flex items-center space-x-2">
            <CheckIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Copied!</span>
          </div>
        </div>
      )}
    </div>
  );
}


