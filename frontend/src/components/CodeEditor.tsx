import { FileItem } from '../types';
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  file: FileItem;
  onChange?: (content: string) => void;
  onAnimationComplete?: () => void;
}

export function CodeEditor({ file, onChange, onAnimationComplete }: CodeEditorProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string>('');
  const viewedFilesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    if (file) {
      const content = file.content || 'No content available';
      
      // If file was already viewed, show content immediately
      if (viewedFilesRef.current.has(file.path)) {
        setDisplayedContent(content);
        setIsAnimating(false);
        return;
      }

      // For new files, show animation
      setIsAnimating(true);
      contentRef.current = '';
      let currentIndex = 0;
      
      const typeText = () => {
        if (currentIndex < content.length) {
          contentRef.current = content.slice(0, currentIndex + 1);
          setDisplayedContent(contentRef.current);
          currentIndex++;
          animationRef.current = setTimeout(typeText, 10);
        } else {
          setIsAnimating(false);
          viewedFilesRef.current.add(file.path);
          onAnimationComplete?.();
        }
      };
      
      // Start typing animation
      typeText();
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [file, onAnimationComplete]);

  return (
    <div className="relative h-full">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        value={displayedContent}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
        }}
      />
      {isAnimating && (
        <div className="absolute bottom-4 right-4 bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-full text-sm">
          Generating...
        </div>
      )}
    </div>
  );
}