import { motion } from 'framer-motion';
import { FolderOpen, File } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Explorer() {
  const { files, activeFileId, setActiveFile, isExplorerOpen } = useAppStore();

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{
        width: isExplorerOpen ? 250 : 0,
        opacity: isExplorerOpen ? 1 : 0,
      }}
      className="h-full bg-gray-900 border-r border-gray-700 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <FolderOpen size={20} />
          <span className="font-medium">Explorer</span>
        </div>
        <div className="space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              whileHover={{ x: 4 }}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                activeFileId === file.id
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
              onClick={() => setActiveFile(file.id)}
            >
              <File size={16} />
              <span className="text-sm">{file.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}