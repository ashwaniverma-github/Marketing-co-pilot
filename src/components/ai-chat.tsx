'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TwitterIcon, CopyIcon, CheckIcon } from './icons';
import { Forward, Edit } from 'lucide-react';
import { eventBus, EVENTS } from '@/lib/event-bus';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

interface AiChatProps {
  productId: string;
  productName: string;
  productUrl: string;
  onOpenEditor?: (content: string, onPostSuccess?: () => void) => void;
}

type ChatRole = 'user' | 'assistant';
type ChatMessage = { 
  role: ChatRole; 
  content: string; 
  isTweet?: boolean; 
  id?: string; 
};

export function AiChat({ productId, productName, productUrl, onOpenEditor }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tweetMode, setTweetMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const { data: session } = useSession();

  // State to manage dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle dropdown menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the menu
      const menuElement = document.getElementById('chat-options-menu');
      if (menuElement && !menuElement.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to generate a stable message ID
  const generateStableMessageId = (content: string, role: ChatRole, isTweet?: boolean) => {
    // Use a combination of content, role, and timestamp for more unique ID
    const baseString = `${role}-${content}-${isTweet || false}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Prefix with 'msg' to match database ID format and add more uniqueness
    return `msg_${Math.abs(hash).toString(36)}`;
  };

  // Memoize functions to prevent unnecessary re-renders
  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      // Reset to minimum height first to properly measure content
      textareaRef.current.style.height = '60px';
      
      // If there's no content, keep minimum height
      if (!input.trim()) {
        textareaRef.current.style.height = '60px';
        return;
      }
      
      // Calculate new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // Maximum height before scrolling
      const minHeight = 60; // Minimum height
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Scroll to bottom whenever messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Function to handle tweet deletion
  const handleDeleteTweet = useCallback((tweetContent: string) => {
    // Find the message with the matching content
    const tweetToDelete = messages.find(m => m.isTweet && m.content === tweetContent);
    
    if (!tweetToDelete) {
      console.warn('Tweet not found for deletion:', { 
        tweetContent, 
        messages: messages.filter(m => m.isTweet).map(m => ({
          content: m.content,
          id: m.id,
          isTweet: m.isTweet
        }))
      });
      return;
    }

    console.log('Tweet to delete:', {
      content: tweetToDelete.content,
      id: tweetToDelete.id,
      isTweet: tweetToDelete.isTweet
    });

    // Send delete request to backend
    const deleteTweet = async () => {
      try {
        // Ensure we have an ID
        if (!tweetToDelete.id) {
          console.error('No ID found for tweet:', tweetToDelete);
          return;
        }

        const response = await fetch('/api/chat-history', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messageId: tweetToDelete.id
          })
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error('Delete tweet error response:', responseData);
          throw new Error(responseData.error || 'Failed to delete tweet');
        }

        // Remove the tweet from messages
        const updatedMessages = messages.filter(m => !(m.isTweet && m.content === tweetContent));
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Error deleting tweet:', error);
        // Optionally show an error toast or notification
      }
    };

    deleteTweet();
  }, [messages]);

  // Function to clear all chat messages
  const handleClearAllChats = useCallback(() => {
    // Send delete request to backend for all messages
    const clearChats = async () => {
      try {
        // Filter out messages that have an ID (to be deleted)
        const messagesToDelete = messages.filter(m => m.id);

        // If no messages to delete, return early
        if (messagesToDelete.length === 0) return;

        // Batch delete messages
        for (const message of messagesToDelete) {
          const response = await fetch('/api/chat-history', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messageId: message.id
            })
          });

          const responseData = await response.json();

          if (!response.ok) {
            console.error('Delete chat error response:', responseData);
            throw new Error(responseData.error || 'Failed to delete chat');
          }
        }

        // Clear all messages from the state
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chats:', error);
        // Show an error toast or notification
        alert('Failed to clear chats. Please try again.');
      }
    };

    clearChats();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {        
        const response = await fetch('/api/chat-history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        // Validate messages is an array of chat messages
        if (Array.isArray(data.messages) && 
            data.messages.length > 0 && 
            data.messages.every((m: ChatMessage) => 
              m.role && ['user', 'assistant'].includes(m.role) && 
              m.content && typeof m.content === 'string'
            )) {
          
          // Generate stable IDs for messages
          const messagesWithStableIds = data.messages.map((m: ChatMessage) => ({
            ...m,
            id: m.id || generateStableMessageId(m.content, m.role, m.isTweet)
          }));
          setMessages(messagesWithStableIds);
        } else {
          console.warn('Invalid messages format:', data.messages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        isInitialLoad.current = false;
      }
    };

    // Only load chat history if it's the initial load
    if (isInitialLoad.current) {
      loadChatHistory();
    }
  }, []); // Empty dependency array as intended

  // Save chat history whenever messages change
  useEffect(() => {
    // Skip saving during initial load or if messages are empty
    if (isInitialLoad.current || messages.length === 0) return;

    const saveChatHistory = async () => {
      try {
        
        const response = await fetch('/api/chat-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.map(msg => ({
              // Always generate a consistent ID
              id: msg.id || generateStableMessageId(msg.content, msg.role, msg.isTweet),
              role: msg.role,
              content: msg.content,
              ...(msg.isTweet ? { isTweet: true } : {})
            }))
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to save chat history');
        }

        
      } catch (error) {
        console.error('Failed to save chat history:', {
          error,
          errorName: error instanceof Error ? error.name : 'Unknown Error',
          errorMessage: error instanceof Error ? error.message : 'No error message'
        });
      }
    };

    // Debounce save to prevent too many requests
    const timeoutId = setTimeout(saveChatHistory, 500);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  /**
   * Streaming-safe markdown formatter
   * - Only converts completed **bold**, *italic*, and [text](url) pairs.
   * - When isStreaming === true it strips unmatched trailing markers so users don't see partial '*' artifacts.
   */
  const formatStreamingContent = (content: string, isStreaming = false) => {
    const stripTrailingUnmatchedMarkers = (txt: string) => {
      let t = txt;
      if (t.endsWith('*') && !t.endsWith('**')) t = t.slice(0, -1);
      const doubleStarMatches = t.match(/\*\*/g);
      const doubleStarCount = doubleStarMatches ? doubleStarMatches.length : 0;
      if (doubleStarCount % 2 === 1) {
        const lastIdx = t.lastIndexOf('**');
        if (lastIdx !== -1) t = t.slice(0, lastIdx) + t.slice(lastIdx + 2);
      }
      return t;
    };
  
    let working = content;
    if (isStreaming) working = stripTrailingUnmatchedMarkers(working);
  
    // Bold — use [\s\S] instead of dotAll
    working = working.replace(/\*\*([\s\S]+?)\*\*/g, (m, g1) => `<BOLD>${g1}</BOLD>`);
  
    // Italic — avoid lookbehind by capturing prefix
    working = working.replace(/(^|[^*])\*([^*]+?)\*(?!\*)/g, (m, prefix, inner) => {
      return `${prefix}<ITALIC>${inner}</ITALIC>`;
    });
  
    // Links
    working = working.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, text, url) => {
      return `<LINK>${text}|${url}</LINK>`;
    });
  
    const parts = working.split(/(<LINK>.*?<\/LINK>|<BOLD>.*?<\/BOLD>|<ITALIC>.*?<\/ITALIC>)/g);
  
    return parts.map((part, index) => {
      if (part.startsWith('<BOLD>') && part.endsWith('</BOLD>')) {
        const boldText = part.slice(6, -7);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
      } else if (part.startsWith('<ITALIC>') && part.endsWith('</ITALIC>')) {
        const italicText = part.slice(8, -9);
        return <em key={index} className="italic">{italicText}</em>;
      } else if (part.startsWith('<LINK>') && part.endsWith('</LINK>')) {
        const linkContent = part.slice(6, -7);
        const [text, url] = linkContent.split('|');
        return (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">
            {text}
          </a>
        );
      }
      return part;
    });
  };
  

  // wrapper used by your code
  const formatContent = (content: string, isStreaming = false) => {
    return formatStreamingContent(content, isStreaming);
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      id: generateStableMessageId(input, 'user')
    };
    const next: ChatMessage[] = [...messages, userMessage];
    setMessages(next);
    setInput('');
    setLoading(true);
    
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px';
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

      if (!res.ok) {
        throw new Error('Chat failed');
      }

      // For tweet mode, we'll still use the existing approach
      if (tweetMode) {
        const data = await res.text();
        if (data.includes('---TWEET---')) {
          // Split multiple tweets and create separate messages
          const tweets = data.split('---TWEET---').map((tweet: string) => tweet.trim()).filter(Boolean);
          const tweetMessages: ChatMessage[] = tweets.map((tweet: string) => ({
            role: 'assistant',
            content: tweet,
            isTweet: true,
            id: generateStableMessageId(tweet, 'assistant', true)
          }));
          setMessages([...next, ...tweetMessages]);
        }
      } else {
        // For streaming responses
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        // Create an assistant message placeholder
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: '',
          id: generateStableMessageId('', 'assistant')
        };
        const updatedMessages = [...next, assistantMessage];
        setMessages(updatedMessages);

        // Start typing effect
        setIsTyping(true);
        setTypingMessage('');

        // Read the streaming response
        while (true) {
          const { done, value } = await reader?.read() || {};
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          
          // Update the last message with the current response (raw)
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              content: fullResponse
            };
            return updatedMessages;
          });

          // Update typing message for typing effect (this will be rendered with streaming formatting)
          setTypingMessage(fullResponse);
        }

        // Finalize the message
        const finalMessage: ChatMessage = {
          role: 'assistant',
          content: fullResponse,
          id: generateStableMessageId(fullResponse, 'assistant')
        };

        // Update messages with the final message
        setMessages(prevMessages => {
          const finalMessages = [...prevMessages];
          finalMessages[finalMessages.length - 1] = finalMessage;
          return finalMessages;
        });

        // Finalize typing effect
        setIsTyping(false);
        setTypingMessage('');
      }
    } catch (e) {
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: 'Sorry, something went wrong.',
        id: generateStableMessageId('Sorry, something went wrong.', 'assistant')
      };
      setMessages([...next, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [autoResizeTextarea]);
  
  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isTyping, scrollToBottom]);
  
  // Listen for tweet posted events
  useEffect(() => {
    // Handler for when a tweet is posted
    const handleTweetPosted = (tweetContent: string) => {
      console.log('Tweet posted event received:', tweetContent);
      // Remove the tweet from messages
      handleDeleteTweet(tweetContent);
    };
    
    // Subscribe to tweet posted events
    eventBus.on(EVENTS.TWEET_POSTED, handleTweetPosted);
    
    // Cleanup: unsubscribe when component unmounts
    return () => {
      eventBus.off(EVENTS.TWEET_POSTED, handleTweetPosted);
    };
  }, [handleDeleteTweet]); // Add handleDeleteTweet to dependency array

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
    <div className="bg-card border border-gray-300 dark:border-gray-800 rounded-xl p-3 w-full hover:shadow-sm transition-shadow relative">
      <div className="flex items-start space-x-3 pt-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {(session as any)?.xAvatar ? (
            <img 
              src={(session as any).xAvatar} 
              alt={(session as any).xDisplayName || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : session?.user?.image ? (
            <img 
              src={session?.user?.image} 
              alt={session?.user?.name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-foreground flex items-center justify-center">
              <span className="text-background font-medium text-sm">
                {(session as any)?.xDisplayName ? (session as any).xDisplayName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleCopyTweet(content)}
                className="p-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors opacity-70 hover:opacity-100"
                title="Copy tweet"
              >
                <CopyIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => onOpenEditor?.(content, () => handleDeleteTweet(content))}
                className="px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-2 transform"
                title="Open in Editor"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Edit</span>
              </button>
            </div>
          </div>
          <div className="text-foreground whitespace-pre-wrap break-words leading-relaxed">{formatContent(content)}</div>
          
          {/* Delete button in bottom right corner */}
          <button
            onClick={() => handleDeleteTweet(content)}
            className="absolute bottom-3 right-3 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-full transition-colors text-red-600 dark:text-red-400"
            title="Delete tweet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Confirmation Modal Component
  const ConfirmModal = () => (
    <div className="bg-background rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-lg p-4">
      <div className="p-4 text-center">
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-red-500 w-9 h-9">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
          </svg>
          <h3 className="text-base font-semibold text-foreground mb-2">Clear All Chats</h3>
          <p className="text-muted-foreground text-sm">Are you sure you want to clear all chats?</p>
        </div>
        <div className="flex justify-center space-x-3">
          <button 
            onClick={() => setIsConfirmModalOpen(false)}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-foreground text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              handleClearAllChats();
              setIsConfirmModalOpen(false);
            }}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative sm:h-[calc(100vh-6.5rem)] flex flex-col sm:overflow-hidden">
      {/* Only show the welcome message when there are no messages */}
      {messages.length === 0 && (
        <h3 className="text-4xl font-serif text-center text-foreground pt-16">What's on your mind today?</h3>
      )}
      
      {/* Content Area (Messages and Tweet Cards) - Scrollable */} 
      {messages.length > 0 && (
        <div className="flex-1 w-11/12 p-2 sm:w-4/5 mx-auto overflow-auto pb-32 scrollbar-hide relative" style={{ height: 'calc(100vh - 14rem)' }}>
          {/* Chat Options Menu */}
          {messages.length > 0 && (
            <div className="absolute top-0 -translate-y-1/8 right-0 z-50">
              <div className="relative" id="chat-options-menu">
                <button 
                  onClick={toggleMenu}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  aria-label="Chat Options"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="19" cy="12" r="1"/>
                    <circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-30 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button 
                      onClick={() => {
                        setIsConfirmModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 hover:bg-muted text-red-600 dark:text-red-400 flex justify-center items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                      <span>delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Regular Messages Section */}
          <div className="space-y-3 mb-6">
            {messages.map((m, i) => {
              // Skip tweet messages as they're displayed separately
              if (m.isTweet) return null;
              
              // Check if this is the most recent AI response and should show typing effect
              const isLatestAIResponse = m.role === 'assistant' && i === messages.length - 1 && !m.isTweet;
              const shouldShowTyping = isLatestAIResponse && isTyping;
              
              return (
                <div key={i} className={`${m.role === 'user' ? 'text-right' : 'text-left'} relative`}>
                  <div className={`inline-block px-3 py-3 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-foreground text-background' : ' text-foreground'} relative`}>
                    <div className="whitespace-pre-wrap break-words">
                      {m.role === 'user' ? m.content : (
                        shouldShowTyping ? (
                          <span>
                            {formatContent(typingMessage, true)}
                            <span className="animate-pulse">|</span>
                          </span>
                        ) : (
                          formatContent(m.content)
                        )
                      )}
                    </div>
                    {/* Removed individual delete buttons */}
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

          {/* Tweet Cards Section - Now above the input area */}
          {messages.filter(m => m.isTweet).length > 0 && (
            <div className="space-y-6 mb-4">
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
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area - Positioned at the bottom */}
      <div className="p-2 bg-background absolute bottom-0 left-0 right-0 w-11/12 sm:w-4/5 mx-auto z-40">
        {/* Input wrapper */}
        <div className="mx-auto rounded-lg bg-background">
          <div className="relative flex items-center rounded-full border-gray-300 border-2 dark:border-0">
            {/* Tweet mode pill placed inside the input area on the left */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={() => setTweetMode((s) => !s)}
                aria-pressed={tweetMode}
                className={`flex items-center space-x-2 px-3 py-1 rounded-xl border transition-all text-sm select-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cyan-600 ${
                  tweetMode
                    ? 'bg-cyan-950 text-white border-transparent'
                    : 'dark:bg-gray-700 text-foreground border-border hover:bg-muted'
                }`}
              >
                <TwitterIcon className="w-4 h-4" />
                <span className="font-medium">Tweet</span>
              </button>
            </div>

            {/* Textarea - add left padding so the pill doesn't overlap the text */}
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
              className="w-full pl-30 pt-4 sm:pl-40 sm:pr-20 sm:py-3 bg-background rounded-full focus:outline-none focus:ring-0 focus:border-4 transition-all resize-none"
              style={{
                outline: 'none',
                boxShadow: 'none',
                borderColor: 'transparent',
                verticalAlign: 'middle',
                textAlign: 'start',
                height: '60px',
              }}
            />

            {/* Loading / Send button on the right */}
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="absolute right-6 bottom-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label="Send"
            >
              {loading ? (
                <div className="animate-spin w-10 h-10 border-2 border-current border-t-transparent rounded-full flex items-center justify-center"></div>
              ) : (
                <div className="w-10 h-10 bg-cyan-950 rounded-xl p-2 flex items-center justify-center">
                  <Forward className="text-white w-full h-full" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */} 
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg transition-all z-50">
          <div className="flex items-center space-x-2">
            <CheckIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Copied!</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="absolute top-0 -translate-y-1/8 bottom-0 left-0 right-0 flex items-center justify-center z-50">
          <ConfirmModal />
        </div>
      )}
    </div>
  );
}
