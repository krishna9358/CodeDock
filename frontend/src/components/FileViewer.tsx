import { X } from 'lucide-react';
import { FileViewerProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FileViewer({ file, onClose }: FileViewerProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (file) {
      setIsTyping(true);
      let currentText = '';
      const content = file.content || 'No content available';
      
      const typeText = () => {
        if (currentText.length < content.length) {
          currentText = content.slice(0, currentText.length + 1);
          setContent(currentText);
          setTimeout(typeText, 10);
        } else {
          setIsTyping(false);
        }
      };
      
      typeText();
    }
  }, [file]);

  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-gray-100">{file.path}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)]">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {content}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-blue-500 ml-1"
                />
              )}
            </pre>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}