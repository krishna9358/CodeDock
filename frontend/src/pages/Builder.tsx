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
import { Code2, Eye, Menu, Plus, Terminal as  RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    let lastGeneratedFile: FileItem | null = null;
    let appFile: FileItem | null = null;
    let totalContentLength = 0;

    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        // Add content length to total
        totalContentLength += step.code?.length || 0;

        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            // final file
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
              
              // Check if this is App.tsx
              if (currentFolderName === 'App.tsx') {
                appFile = newFile;
              }
            } else {
              file.content = step.code;
              lastGeneratedFile = file;
              
              // Check if this is App.tsx
              if (currentFolderName === 'App.tsx') {
                appFile = file;
              }
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
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
      // First select App.tsx if it exists, otherwise select the last generated file
      if (appFile) {
        setSelectedFile(appFile);
      } else if (lastGeneratedFile) {
        setSelectedFile(lastGeneratedFile);
      }
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
      }))

      // Calculate delay based on content length (5ms per character, minimum 20s, maximum 30s)
      const baseDelay = Math.min(Math.max(totalContentLength * 5, 40000), 50000);
      
      // Add a small random delay (0-2s) to make it feel more natural
      const randomDelay = Math.random() * 5000;
      const finalDelay = baseDelay + randomDelay;

      // Switch to preview tab after the calculated delay
      setTimeout(() => {
        setActiveTab('preview');
      }, finalDelay);
    }
  }, [steps, files]);

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
            onClick={() => {
              setActiveTab('preview');

            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              activeTab === 'preview' 
                ? 'bg-secondary text-secondary-foreground shadow-lg' 
                : 'text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
            {activeTab === 'preview' && (
              <button
                
                className="ml-2 p-1 hover:bg-background/50 rounded-md"
              >
                <RefreshCw className={`w-3 h-3 ${previewLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </button>
        </div>
        {/* <div className="flex items-center space-x-2">
          <button 
            onClick={() => setTerminalVisible(!terminalVisible)}
            className={`hover:bg-secondary/80 p-2 rounded-lg transition-colors ${
              terminalVisible ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`}
          >
            <TerminalIcon className="w-5 h-5" />
          </button>
          <button className="hover:bg-secondary/80 p-2 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div> */}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Explorer */}
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
                  <FileExplorer
                    files={files}
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                  />
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
                  <CodeEditor
                    file={selectedFile}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-lg overflow-hidden border border-border/40 shadow-2xl bg-white"
                >
                  {previewLoading ? (
                    <div className="h-full flex items-center justify-center bg-background/95">
                      <div className="text-center space-y-4">
                        <Loader />
                        <p className="text-sm text-muted-foreground">Loading preview...</p>
                      </div>
                    </div>
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
                    onStepClick={setCurrentStep}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Panel */}
      {/* <AnimatePresence>
        {terminalVisible && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 300 }}
            exit={{ height: 0 }}
            className="border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <Terminal webContainer={webcontainer || null} />
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}