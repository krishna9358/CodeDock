import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Terminal() {
  const { isTerminalOpen, toggleTerminal } = useAppStore();

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: isTerminalOpen ? 200 : 0 }}
      className="bg-gray-900 border-t border-gray-700 overflow-hidden"
    >
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
          <TerminalIcon size={16} />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <button
          onClick={toggleTerminal}
          className="text-gray-400 hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-4 text-gray-300 font-mono text-sm">
        <div>$ npm run dev</div>
        <div className="text-green-400">Ready on http://localhost:5173</div>
      </div>
    </motion.div>
  );
}