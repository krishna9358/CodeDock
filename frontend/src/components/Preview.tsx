import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export function Preview() {
  const { files, activeFileId } = useAppStore();
  const activeFile = files.find((f) => f.id === activeFileId);

  if (!activeFile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 h-full bg-white"
    >
      <iframe
        title="Preview"
        srcDoc={activeFile.content}
        className="w-full h-full border-none"
        sandbox="allow-scripts"
      />
    </motion.div>
  );
}