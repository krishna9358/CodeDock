import Editor from '@monaco-editor/react';
import { FileItem } from '../types';
import { useEffect, useState } from 'react';

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!file?.content) {
      setDisplayedContent('');
      return;
    }

    setIsAnimating(true);
    let currentIndex = 0;
    const content = file.content;
    const typingSpeed = 10; // milliseconds per character

    const typeNextChar = () => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      } else {
        setIsAnimating(false);
      }
    };

    typeNextChar();

    return () => {
      setIsAnimating(false);
    };
  }, [file?.content]);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

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