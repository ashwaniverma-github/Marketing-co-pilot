'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, Hash } from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  platform?: 'twitter' | 'linkedin' | 'reddit';
  className?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "What's happening?", 
  maxLength = 280,
  platform = 'twitter',
  className = "" 
}: RichTextEditorProps) {
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
      CharacterCount.configure({
        limit: maxLength,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${
          platform === 'twitter' ? 'min-h-[120px]' : 'min-h-[100px]'
        }`,
      },
    },
  });

  const characterCount = editor?.storage?.characterCount?.characters() || 0;
  const isOverLimit = characterCount > maxLength;

  const toggleBold = () => {
    if (editor && !editor.isDestroyed) {
      editor.chain().focus().toggleBold().run();
    }
  };

  const toggleItalic = () => {
    if (editor && !editor.isDestroyed) {
      editor.chain().focus().toggleItalic().run();
    }
  };

  const addLink = () => {
    if (editor && !editor.isDestroyed) {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  const addHashtag = () => {
    if (editor && !editor.isDestroyed) {
      const hashtag = window.prompt('Enter hashtag (without #):');
      if (hashtag) {
        editor.chain().focus().insertContent(`#${hashtag} `).run();
      }
    }
  };

  const getPlatformLimits = () => {
    switch (platform) {
      case 'twitter':
        return { max: 280, warning: 260 };
      case 'linkedin':
        return { max: 3000, warning: 2900 };
      case 'reddit':
        return { max: 40000, warning: 39000 };
      default:
        return { max: 280, warning: 260 };
    }
  };

  const { max, warning } = getPlatformLimits();
  const isNearLimit = characterCount > warning;

  if (!editor) {
    return (
      <div className={`border rounded-xl bg-background ${className} min-h-[180px] flex items-center justify-center`}>
        <div className="text-muted-foreground text-sm">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl bg-background ${className}`}>
      {/* Toolbar */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleBold}
            className={`${editor.isActive('bold') ? 'bg-muted' : ''}`}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleItalic}
            className={`${editor.isActive('italic') ? 'bg-muted' : ''}`}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addHashtag}
          >
            <Hash className="w-4 h-4" />
          </Button>
        </div>

        {/* Character Count */}
        <div className="flex items-center space-x-2">
          <span 
            className={`text-sm font-medium ${
              isOverLimit 
                ? 'text-red-500' 
                : isNearLimit 
                ? 'text-yellow-500' 
                : 'text-muted-foreground'
            }`}
          >
            {characterCount}/{max}
          </span>
          {/* Progress Circle */}
          <div className="relative w-6 h-6">
            <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/30"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 10}`}
                strokeDashoffset={`${2 * Math.PI * 10 * (1 - Math.min(characterCount / max, 1))}`}
                className={`transition-all duration-300 ${
                  isOverLimit 
                    ? 'text-red-500' 
                    : isNearLimit 
                    ? 'text-yellow-500' 
                    : 'text-blue-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:shadow-none"
        />
      </div>
    </div>
  );
}
