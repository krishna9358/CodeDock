import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { FileNode } from '@webcontainer/api';
import { Loader } from '../components/Loader';
import { Code2, Eye, FolderGit2, Play, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileExplorerCollapsed, setFileExplorerCollapsed] = useState(false);
  const [previewMaximized, setPreviewMaximized] = useState(false);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
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
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
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

      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
        
      }))
    }
    console.log(files);
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col h-screen overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="glass-panel border-b border-gray-700/50 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium gradient-text">Website Builder</h1>
          <div className="h-4 w-px bg-gray-700/50"></div>
          <p className="text-sm text-gray-400 truncate max-w-md">{prompt}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'code' 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'preview' 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Steps */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-0' : 'w-80'} flex-shrink-0`}>
          <div className="h-full glass-panel border-r border-gray-700/50 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold gradient-text">Build Steps</h2>
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded-md hover:bg-gray-800/50 text-gray-400 hover:text-gray-300"
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
            <StepsList 
              steps={steps} 
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File Explorer and Editor/Preview Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* File Explorer */}
            <div className={`transition-all duration-300 ${fileExplorerCollapsed ? 'w-0' : 'w-64'} flex-shrink-0`}>
              <div className="h-full glass-panel border-r border-gray-700/50 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Files</h3>
                  <button 
                    onClick={() => setFileExplorerCollapsed(!fileExplorerCollapsed)}
                    className="p-1 rounded-md hover:bg-gray-800/50 text-gray-400 hover:text-gray-300"
                  >
                    {fileExplorerCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                </div>
                <FileExplorer
                  files={files}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                />
              </div>
            </div>

            {/* Editor/Preview Area */}
            <div className={`flex-1 overflow-hidden ${previewMaximized ? 'fixed inset-0 z-50' : ''}`}>
              <div className="h-full flex flex-col">
                {/* Editor/Preview Header */}
                <div className="glass-panel border-b border-gray-700/50 p-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {activeTab === 'code' ? (
                      <>
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium">
                          {selectedFile ? selectedFile.name : 'Select a file to edit'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium">Preview</span>
                      </>
                    )}
                  </div>
                  {activeTab === 'preview' && (
                    <button
                      onClick={() => setPreviewMaximized(!previewMaximized)}
                      className="p-1 rounded-md hover:bg-gray-800/50 text-gray-400 hover:text-gray-300"
                    >
                      {previewMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  )}
                </div>
                
                {/* Editor/Preview Content */}
                <div className="flex-1 overflow-auto">
                  {activeTab === 'code' ? (
                    <CodeEditor
                      file={selectedFile}
                      onChange={(content) => {
                        if (selectedFile) {
                          setFiles(files.map(f => 
                            f.path === selectedFile.path 
                              ? { ...f, content } 
                              : f
                          ));
                        }
                      }}
                    />
                  ) : (
                    <PreviewFrame />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}