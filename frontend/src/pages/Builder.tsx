import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Code2, Eye, Menu, Plus, MessageSquare, FolderOpen, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { FollowUpMessage } from '../components/FollowUpMessage';

type LlmMessage = { role: 'user' | 'assistant'; content: string };

function createMountStructure(files: FileItem[]): Record<string, any> {
  const root: Record<string, any> = {};

  const place = (entry: FileItem, target: Record<string, any>) => {
    if (entry.type === 'folder') {
      target[entry.name] = { directory: {} };
      entry.children?.forEach(child => place(child, target[entry.name].directory));
    } else {
      target[entry.name] = { file: { contents: entry.content ?? '' } };
    }
  };

  files.forEach(file => place(file, root));
  return root;
}

function findAppFile(files: FileItem[]): FileItem | null {
  const candidates = ['App.tsx', 'App.jsx', 'app.tsx', 'main.tsx', 'index.tsx', 'index.jsx'];
  const walk = (items: FileItem[]): FileItem | null => {
    for (const item of items) {
      if (item.type === 'file' && candidates.includes(item.name)) return item;
    }
    for (const item of items) {
      if (item.type === 'folder' && item.children) {
        const found = walk(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(files);
}

function findFirstFile(files: FileItem[]): FileItem | null {
  for (const item of files) {
    if (item.type === 'file') return item;
    if (item.type === 'folder' && item.children) {
      const found = findFirstFile(item.children);
      if (found) return found;
    }
  }
  return null;
}

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt } = location.state as { prompt: string };
  const webcontainer = useWebContainer();

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [llmMessages, setLlmMessages] = useState<LlmMessage[]>([]);

  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [sidebarTab, setSidebarTab] = useState<'files' | 'chat'>('files');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [chatLoading, setChatLoading] = useState(false);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [installing, setInstalling] = useState(false);
  const [installLog, setInstallLog] = useState<string[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const installStartedRef = useRef(false);
  const initStartedRef = useRef(false);
  const userSelectedFileRef = useRef(false);

  // Process pending steps into the file tree
  useEffect(() => {
    const pendingSteps = steps.filter(s => s.status === 'pending');
    if (pendingSteps.length === 0) return;

    const updatedFiles = [...files];
    let appFile: FileItem | null = null;
    let firstNewFile: FileItem | null = null;

    pendingSteps.forEach(step => {
      if (step?.type !== StepType.CreateFile || !step.path) return;

      const segments = step.path.split('/').filter(Boolean);
      let currentLevel = updatedFiles;
      let currentPath = '';

      segments.forEach((segment, idx) => {
        currentPath = `${currentPath}/${segment}`;
        const isLast = idx === segments.length - 1;

        if (isLast) {
          const existingIdx = currentLevel.findIndex(x => x.path === currentPath);
          const fileEntry: FileItem = {
            name: segment,
            type: 'file',
            path: currentPath,
            content: step.code ?? '',
          };
          if (existingIdx === -1) {
            currentLevel.push(fileEntry);
          } else {
            currentLevel[existingIdx] = fileEntry;
          }
          if (!firstNewFile) firstNewFile = fileEntry;
          if (segment === 'App.tsx' || segment === 'App.jsx') appFile = fileEntry;
        } else {
          let folder = currentLevel.find(x => x.path === currentPath);
          if (!folder) {
            folder = { name: segment, type: 'folder', path: currentPath, children: [] };
            currentLevel.push(folder);
          }
          if (!folder.children) folder.children = [];
          currentLevel = folder.children;
        }
      });
    });

    setFiles(updatedFiles);

    if (chatCompleted) {
      if (!userSelectedFileRef.current) {
        const target = appFile || firstNewFile || findFirstFile(updatedFiles);
        if (target) setSelectedFile(target);
      } else if (appFile) {
        setSelectedFile(prev => (prev && prev.path === appFile!.path ? appFile : prev));
      }
    }

    setSteps(prev => prev.map(s => (s.status === 'pending' ? { ...s, status: 'completed' } : s)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, chatCompleted]);

  // Mount files to WebContainer whenever they change
  useEffect(() => {
    if (!webcontainer || files.length === 0) return;
    const mountStructure = createMountStructure(files);
    webcontainer.mount(mountStructure).catch(err => {
      console.error('Mount failed:', err);
    });
  }, [files, webcontainer]);

  // Listen for server-ready exactly once
  useEffect(() => {
    if (!webcontainer) return;
    webcontainer.on('server-ready', (_port, url) => {
      setServerUrl(url);
      setInstalling(false);
      setInstallLog(prev => [...prev, '', `✅ Server ready at ${url}`]);
      setActiveTab('preview');
    });
  }, [webcontainer]);

  // Auto-start installation once chat is done, files are processed, and WebContainer is ready
  useEffect(() => {
    if (!chatCompleted || !webcontainer || installStartedRef.current) return;
    if (files.length === 0) return;
    installStartedRef.current = true;
    void runInstallation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatCompleted, webcontainer, files]);

  const runInstallation = async () => {
    if (!webcontainer) return;
    setInstalling(true);
    setInstallLog(['$ pnpm install']);

    try {
      const installProcess = await webcontainer.spawn('pnpm', ['install']);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const line = data.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();
            if (!line) return;
            setInstallLog(prev => [...prev, line].slice(-200));
          },
        }),
      );

      const exitCode = await installProcess.exit;
      if (exitCode !== 0) {
        setInstallLog(prev => [...prev, `❌ Install failed (exit ${exitCode})`]);
        setInstalling(false);
        return;
      }

      setInstallLog(prev => [...prev, '', '$ pnpm dev']);
      const devProcess = await webcontainer.spawn('pnpm', ['dev']);
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const line = data.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();
            if (!line) return;
            setInstallLog(prev => [...prev, line].slice(-200));
          },
        }),
      );
    } catch (e: any) {
      console.error('Installation failed:', e);
      setInstallLog(prev => [...prev, `❌ Error: ${e?.message || e}`]);
      setInstalling(false);
    }
  };

  // Init: fetch template + chat
  async function init() {
    try {
      const templateResp = await axios.post(`${BACKEND_URL}/template`, { prompt: prompt.trim() });
      const { prompts, uiPrompts } = templateResp.data;

      const templateSteps = parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: 'pending' as const,
      }));
      setSteps(templateSteps);

      setChatLoading(true);
      const chatResp = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map((content: string) => ({ role: 'user', content })),
      });

      const responseText: string = chatResp.data?.response ?? '';
      const chatSteps = parseXml(responseText);

      setChatLoading(false);

      if (chatSteps.length === 0) {
        setError(
          'The AI response did not include any generated files. The format may have been malformed. Try a different prompt.',
        );
        return;
      }

      setChatCompleted(true);
      setSteps(prev => [
        ...prev.map(s => (s.status === 'pending' ? { ...s, status: 'completed' as const } : s)),
        ...chatSteps.map(x => ({ ...x, status: 'pending' as const })),
      ]);

      setLlmMessages([
        ...[...prompts, prompt].map((content: string) => ({ role: 'user' as const, content })),
        { role: 'assistant', content: responseText },
      ]);
    } catch (e: any) {
      console.error('Init failed:', e);
      setChatLoading(false);
      setError(
        e?.response?.data?.message || e?.message || 'Failed to generate project. Please try again.',
      );
    }
  }

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewChat = () => {
    if (
      window.confirm('Are you sure you want to start a new chat? This will clear your current progress.')
    ) {
      sessionStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  const handleFollowUpMessage = async (message: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, { role: 'user', content: message }],
      });

      const responseText: string = response.data?.response ?? '';
      setLlmMessages(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: responseText },
      ]);

      const followUpSteps = parseXml(responseText);
      if (followUpSteps.length > 0) {
        setSteps(prev => [
          ...prev,
          ...followUpSteps.map(x => ({ ...x, status: 'pending' as const })),
        ]);
      }
    } catch (err) {
      console.error('Error sending follow-up message:', err);
    }
  };

  const handleFileSelect = (file: FileItem) => {
    userSelectedFileRef.current = true;
    setSelectedFile(file);
  };

  const showCodeLoading = chatLoading && !selectedFile && !error;

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-14 border-b border-border/40 backdrop-blur-xl bg-background/30 flex items-center px-4 justify-between sticky top-0 z-50"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hover:bg-secondary/80 p-2 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-secondary/80 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-muted-foreground">New Chat</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              activeTab === 'code'
                ? 'bg-secondary text-secondary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              activeTab === 'preview'
                ? 'bg-secondary text-secondary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
            {installing && !serverUrl && (
              <span className="ml-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            )}
            {serverUrl && (
              <span className="ml-1 w-2 h-2 rounded-full bg-green-400" />
            )}
          </button>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border/40 bg-background/50 backdrop-blur-xl"
            >
              <div className="flex-1 overflow-hidden">
                <div className="p-4">
                  <div className="flex border-b border-border/40 mb-4">
                    <button
                      onClick={() => setSidebarTab('files')}
                      className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 text-sm ${
                        sidebarTab === 'files'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Files</span>
                    </button>
                    <button
                      onClick={() => setSidebarTab('chat')}
                      className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 text-sm ${
                        sidebarTab === 'chat'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {sidebarTab === 'files' ? (
                      <motion.div
                        key="files"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <FileExplorer
                          files={files}
                          selectedFile={selectedFile}
                          onFileSelect={handleFileSelect}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-[calc(100vh-12rem)]"
                      >
                        <FollowUpMessage
                          onSendMessage={handleFollowUpMessage}
                          initialMessages={llmMessages.map((msg, i) => ({
                            id: `${i}-${msg.role}`,
                            content: msg.content,
                            type: msg.role === 'user' ? 'user' : 'bot',
                            timestamp: new Date(),
                          }))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-hidden bg-background/30">
          <div className="h-10 border-b border-border/40 flex items-center px-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              {activeTab === 'code' ? (
                <>
                  <Code2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.path : 'Generating files...'}
                  </span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {serverUrl ? 'Live Preview' : installing ? 'Compiling…' : 'Preview'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'code' ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-lg overflow-hidden border border-border/40 shadow-2xl"
                >
                  {error ? (
                    <div className="h-full flex items-center justify-center bg-background/50 p-8">
                      <div className="text-center space-y-3 max-w-md">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                        <p className="text-sm text-red-400">{error}</p>
                        <button
                          onClick={handleNewChat}
                          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors"
                        >
                          Start a new chat
                        </button>
                      </div>
                    </div>
                  ) : showCodeLoading ? (
                    <div className="h-full flex items-center justify-center bg-background/50">
                      <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground">Generating your code...</p>
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <CodeEditor file={selectedFile} />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-background/50">
                      <p className="text-sm text-muted-foreground">
                        Select a file from the explorer to view its contents.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-lg overflow-hidden border border-border/40 shadow-2xl bg-white"
                >
                  <PreviewFrame
                    url={serverUrl}
                    installLog={installLog}
                    installing={installing}
                    chatCompleted={chatCompleted}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border/40 bg-background/50 backdrop-blur-xl"
            >
              <div className="flex-1 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-muted-foreground">Build Steps</h2>
                  </div>
                  <StepsList steps={steps} currentStep={1} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
