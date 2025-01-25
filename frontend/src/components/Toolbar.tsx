import { motion } from 'framer-motion';
import {
  Menu,
  Monitor,
  Sun,
  Moon,
  Terminal as TerminalIcon,
  Code,
  Eye,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Toolbar() {
  const { toggleExplorer, toggleTerminal, theme, toggleTheme, activeTab, setActiveTab } = useAppStore();

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleExplorer}
          className="text-gray-400 hover:text-gray-200"
        >
          <Menu size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          New Chat
        </motion.button>
        <div className="h-6 w-px bg-gray-700 mx-2" />
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <motion.button
            whileHover={{ backgroundColor: '#2c2e33' }}
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 flex items-center gap-1.5 text-sm ${
              activeTab === 'code'
                ? 'bg-gray-800 text-blue-400'
                : 'text-gray-400'
            }`}
          >
            <Code size={14} />
            Code
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: '#2c2e33' }}
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 flex items-center gap-1.5 text-sm ${
              activeTab === 'preview'
                ? 'bg-gray-800 text-blue-400'
                : 'text-gray-400'
            }`}
          >
            <Eye size={14} />
            Preview
          </motion.button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="text-gray-400 hover:text-gray-200"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTerminal}
          className="text-gray-400 hover:text-gray-200"
        >
          <TerminalIcon size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="text-gray-400 hover:text-gray-200"
        >
          <Monitor size={20} />
        </motion.button>
      </div>
    </div>
  );
}