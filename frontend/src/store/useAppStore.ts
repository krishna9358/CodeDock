import { create } from 'zustand';

interface File {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface AppState {
  promptScreen: boolean;
  prompt: string;
  files: File[];
  activeFileId: string | null;
  isExplorerOpen: boolean;
  isTerminalOpen: boolean;
  activeTab: 'code' | 'preview';
  theme: 'light' | 'dark';
  setPrompt: (prompt: string) => void;
  submitPrompt: () => void;
  addFile: (file: File) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  toggleExplorer: () => void;
  toggleTerminal: () => void;
  toggleTheme: () => void;
  setActiveTab: (tab: 'code' | 'preview') => void;
}

export const useAppStore = create<AppState>((set) => ({
  promptScreen: true,
  prompt: '',
  files: [
    {
      id: '1',
      name: 'main.tsx',
      content: 'console.log("Hello, Bolt!");',
      language: 'typescript',
    },
  ],
  activeFileId: '1',
  isExplorerOpen: true,
  isTerminalOpen: true,
  activeTab: 'code',
  theme: 'dark',

  setPrompt: (prompt) => set({ prompt }),
  
  submitPrompt: () => set({ promptScreen: false }),

  addFile: (file) =>
    set((state) => ({ files: [...state.files, file] })),

  setActiveFile: (fileId) =>
    set({ activeFileId: fileId }),

  updateFileContent: (fileId, content) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, content } : file
      ),
    })),

  toggleExplorer: () =>
    set((state) => ({ isExplorerOpen: !state.isExplorerOpen })),

  toggleTerminal: () =>
    set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),
}));