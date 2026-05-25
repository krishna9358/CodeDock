import { FileItem } from '../types';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  file: FileItem;
  onChange?: (content: string) => void;
  onAnimationComplete?: () => void;
}

const languageMap: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  css: 'css',
  scss: 'scss',
  html: 'html',
  md: 'markdown',
  py: 'python',
  yml: 'yaml',
  yaml: 'yaml',
};

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return languageMap[ext] ?? 'plaintext';
}

export function CodeEditor({ file }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={getLanguage(file.name)}
      theme="vs-dark"
      value={file.content ?? ''}
      path={file.path}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        renderLineHighlight: 'none',
      }}
    />
  );
}
