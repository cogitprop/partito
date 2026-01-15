import React, { useState, useRef, useCallback, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

// Configure DOMPurify to only allow safe HTML elements and attributes
const sanitizeConfig = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br', 'p'],
  ALLOWED_ATTR: ['href'],
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  maxLength,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sanitize value for safe rendering
  const sanitizedValue = useMemo(() => {
    return DOMPurify.sanitize(value || '', sanitizeConfig);
  }, [value]);

  const execCommand = useCallback((command: string, val: string | null = null) => {
    document.execCommand(command, false, val || undefined);
    editorRef.current?.focus();
    handleInput();
  }, []);

  const handleInput = useCallback(() => {
    const content = editorRef.current?.innerHTML || '';
    // Sanitize content before passing to onChange
    const sanitized = DOMPurify.sanitize(content, sanitizeConfig);
    onChange(sanitized);
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    // Validate URL - only allow http/https protocols
    if (url) {
      if (/^https?:\/\//i.test(url)) {
        execCommand('createLink', url);
      } else if (url.includes('.') && !url.includes(':')) {
        // Allow URLs without protocol, prepend https
        execCommand('createLink', `https://${url}`);
      } else {
        alert('Please enter a valid HTTP or HTTPS URL');
      }
    }
  }, [execCommand]);

  const textLength = (value || '').replace(/<[^>]*>/g, '').length;
  const isNearLimit = maxLength && textLength > maxLength * 0.9;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className={cn(
          'border rounded-md overflow-hidden transition-all duration-200',
          isFocused
            ? 'border-coral shadow-[0_0_0_3px_rgba(255,107,107,0.1)]'
            : 'border-warm-gray-300'
        )}
      >
        {/* Toolbar */}
        <div className="flex gap-1 p-2 border-b border-warm-gray-100 bg-warm-gray-50">
          <ToolbarButton
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton onClick={insertLink} title="Insert Link">
            <Icon name="link" size={16} />
          </ToolbarButton>
          <div className="w-px bg-warm-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <span className="text-xs">• •</span>
          </ToolbarButton>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          dangerouslySetInnerHTML={{ __html: sanitizedValue }}
          className="min-h-[120px] p-4 text-base font-body text-warm-gray-900 leading-relaxed outline-none"
          data-placeholder={placeholder}
          style={{
            // Show placeholder when empty
            ...((!value || value === '<br>') && {
              position: 'relative',
            }),
          }}
        />
      </div>

      {/* Character count */}
      {maxLength && (
        <div className="text-right">
          <span
            className={cn(
              'text-xs',
              isNearLimit ? 'text-warning' : 'text-warm-gray-500'
            )}
          >
            {textLength}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  children,
  title,
  active = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      'w-8 h-8 flex items-center justify-center rounded-sm transition-colors',
      active
        ? 'bg-warm-gray-200 text-warm-gray-900'
        : 'bg-transparent text-warm-gray-700 hover:bg-warm-gray-100'
    )}
  >
    {children}
  </button>
);
