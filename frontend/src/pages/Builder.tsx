import { useEffect, useState } from 'react';
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
import { Loader } from '../components/Loader';
import { Code2, Eye, Menu, Plus, Terminal as RefreshCw, MessageSquare, FolderOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { InteractiveLoader } from '../components/InteractiveLoader';
import { FollowUpMessage } from '../components/FollowUpMessage';
// import { Terminal } from '../components/Terminal';

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt } = location.state as { prompt: string };
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const [showInteractiveLoader, setShowInteractiveLoader] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<FileItem[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<'files' | 'chat'>('files');
  const [isFileAnimationComplete, setIsFileAnimationComplete] = useState(false);
  const [isFileAnimationInProgress, setIsFileAnimationInProgress] = useState(false);
  const [hasReceivedFiles, setHasReceivedFiles] = useState(false);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    let lastGeneratedFile: FileItem | null = null;
    let appFile: FileItem | null = null;
    let totalContentLength = 0;
    let newFiles: FileItem[] = [];

    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        totalContentLength += step.code?.length || 0;

        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              const newFile = {
                name: currentFolderName,
                type: 'file' as const,
                path: currentFolder,
                content: step.code
              };
              currentFileStructure.push(newFile);
              lastGeneratedFile = newFile;
              newFiles.push(newFile);
              
              if (currentFolderName === 'App.tsx') {
                appFile = newFile;
              }
            } else {
              file.content = step.code;
              lastGeneratedFile = file;
              newFiles.push(file);
              
              if (currentFolderName === 'App.tsx') {
                appFile = file;
              }
            }
          } else {
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    })

    if (updateHappened) {
      setFiles(originalFiles);
      setProcessedFiles(newFiles);
      setHasReceivedFiles(true);
      
      if (appFile) {
        setSelectedFile(appFile);
      } else if (lastGeneratedFile) {
        setSelectedFile(lastGeneratedFile);
      }
      
      setSteps(steps => steps.map((s: Step) => ({
        ...s,
        status: "completed"
      })));

      if (webcontainer && !isInstalling) {
        setIsInstalling(true);
        startInstallation();
      }

      const baseDelay = Math.min(Math.max(totalContentLength * 5, 40000), 50000);
      const randomDelay = Math.random() * 5000;
      const finalDelay = baseDelay + randomDelay;

      setTimeout(() => {
        setActiveTab('preview');
        setShowInteractiveLoader(true);
        setShowFollowUp(true);
      }, finalDelay);
    }
  }, [steps, files, webcontainer, isInstalling]);

  // Function to start the installation process
  const startInstallation = async () => {
    if (!webcontainer || !hasReceivedFiles) return;

    try {
      setIsInstalling(false);
      console.log('Starting dependency installation...');
      
      // Create package.json if it doesn't exist
      const packageJson = files.find(f => f.path === '/package.json');
      if (!packageJson) {
        await webcontainer.fs.writeFile('/package.json', JSON.stringify({
          name: 'my-project',
          type: 'module',
          scripts: {
            dev: 'vite'
          }
        }));
      }

      const installProcess = await webcontainer.spawn('pnpm', ['install']);
      console.log('installProcess', installProcess);
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('📦 Installing:', data);
        }
      }));



      const installExitCode = await installProcess.exit;
      console.log('✅ Dependencies installed with exit code:', installExitCode);

      if (installExitCode === 0) {
        console.log('Starting development server...');
        const devProcess = await webcontainer.spawn('pnpm', ['dev']);
        
        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('🚀 Dev Server:', data);
          }
        }));

        webcontainer.on('server-ready', (port, url) => {
          console.log('--------------------------------');
          console.log('🎉 Server is ready!');
          console.log('🌐 URL:', url);
          console.log('🔌 Port:', port);
          console.log('--------------------------------');
        });
      }
    } catch (error) {
      console.error('❌ Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    
    const {prompts, uiPrompts} = response.data;

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
  }

  useEffect(() => {
    init();
  }, [])

  // Show loading state while WebContainer initializes
  // if (!webcontainer) {
  //   return (
  //     <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
  //       <div className="text-center space-y-4">
  //         <div className="relative">
  //           <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-20 animate-pulse"></div>
  //           <Loader />
  //         </div>
  //         <p className="text-lg text-muted-foreground animate-pulse">Initializing environment...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const handleNewChat = () => {
    if (window.confirm('Are you sure you want to start a new chat? This will clear your current progress.')) {
      navigate('/');
      window.location.reload();
    sessionStorage.clear();
    }
  };

  // Function to process files one by one with slower animation
  useEffect(() => {
    if (processedFiles.length > 0 && currentFileIndex < processedFiles.length) {
      const timer = setTimeout(() => {
        setSelectedFile(processedFiles[currentFileIndex]);
        setCurrentFileIndex(prev => prev + 1);
      }, 3000); // Show each file for 3 seconds

      return () => clearTimeout(timer);
    } else if (currentFileIndex >= processedFiles.length) {
      setIsFileAnimationComplete(true);
    }
  }, [processedFiles, currentFileIndex]);

  // Function to handle follow-up messages
  const handleFollowUpMessage = async (message: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, { role: "user", content: message }]
      });
      
      setLlmMessages(prev => [...prev, 
        { role: "user", content: message },
        { role: "assistant", content: response.data }
      ]);
    } catch (error) {
      console.error('Error sending follow-up message:', error);
    }
  };

  // Function to handle file animation completion
  const handleFileAnimationComplete = () => {
    setIsFileAnimationInProgress(false);
    if (currentFileIndex < processedFiles.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
    }
  };

  // Effect to handle file switching
  useEffect(() => {
    if (processedFiles.length > 0 && !isFileAnimationInProgress && currentFileIndex < processedFiles.length) {
      setSelectedFile(processedFiles[currentFileIndex]);
      setIsFileAnimationInProgress(true);
    }
  }, [processedFiles, currentFileIndex, isFileAnimationInProgress]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Top Navigation Bar */}
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
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
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
                  {/* Sidebar Tabs */}
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

                  {/* Tab Content */}
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
                          onFileSelect={setSelectedFile}
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
                          initialMessages={llmMessages.map(msg => ({
                            id: Date.now().toString(),
                            content: msg.content,
                            type: msg.role === 'user' ? 'user' : 'bot',
                            timestamp: new Date()
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

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/30">
          {/* Editor Header */}
          <div className="h-10 border-b border-border/40 flex items-center px-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              {activeTab === 'code' ? (
                <>
                  <Code2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'Select a file to edit'}
                  </span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Preview</span>
                </>
              )}
            </div>
          </div>

          {/* Editor Content */}
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
                  {selectedFile && (
                    <CodeEditor
                      file={selectedFile}
                      onChange={(content) => {
                        setFiles(files.map(f =>
                          f.path === selectedFile.path
                            ? { ...f, content }
                            : f
                        ));
                      }}
                      onAnimationComplete={handleFileAnimationComplete}
                    />
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
                  {showInteractiveLoader ? (
                    <InteractiveLoader
                      onComplete={() => setShowInteractiveLoader(false)}
                      files={processedFiles}
                      onInstallDependencies={startInstallation}
                    />
                  ) : (
                    <PreviewFrame webContainer={webcontainer || null} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar - Steps */}
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
                    {isProcessing && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    )}
                  </div>
                  <StepsList 
                    steps={steps} 
                    currentStep={currentStep}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}