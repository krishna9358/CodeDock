import { X } from 'lucide-react';
import { FileViewerProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// Cache to store viewed files
const viewedFiles = new Set<string>();

export function FileViewer({ file, onClose }: FileViewerProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const hasBeenViewed = useRef(false);

  useEffect(() => {
    if (file) {
      setIsTyping(true);
      const content = file.content || 'No content available';
      
      // Check if file has been viewed before
      if (viewedFiles.has(file.path)) {
        setContent(content);
        setIsTyping(false);
        return;
      }

      // Add to viewed files cache
      viewedFiles.add(file.path);
      
      let currentText = '';
      const chunkSize = 10; // Process 5 characters at a time for smoother animation
      
      const typeText = () => {
        if (currentText.length < content.length) {
          const nextChunkEnd = Math.min(currentText.length + chunkSize, content.length);
          currentText = content.slice(0, nextChunkEnd);
          setContent(currentText);
          requestAnimationFrame(typeText);
        } else {
          setIsTyping(false);
        }
      };
      
      requestAnimationFrame(typeText);
    }

    return () => {
      hasBeenViewed.current = true;
    };
  }, [file]);

  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
            <h3 className="text-lg font-medium text-gray-100 truncate max-w-[80%]">
              {file.path}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <motion.div 
            className="p-4 overflow-auto max-h-[calc(80vh-4rem)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {content}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-blue-500 ml-1"
                />
              )}
            </pre>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}