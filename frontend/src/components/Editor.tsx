import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useAppStore } from '../store/useAppStore';

export function Editor() {
  const { files, activeFileId, updateFileContent, theme } = useAppStore();
  const activeFile = files.find((f) => f.id === activeFileId);

  if (!activeFile) return null;

  return (
    <div className="flex-1 h-full">
      <MonacoEditor
        height="100%"
        language={activeFile.language}
        value={activeFile.content}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={(value) => updateFileContent(activeFile.id, value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}