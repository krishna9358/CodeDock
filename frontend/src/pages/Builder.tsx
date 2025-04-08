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
import { Code2, Eye, Menu, Plus, Terminal, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="h-screen flex flex-col bg-[#1E1E1E] text-gray-100">
      {/* Top Navigation Bar */}
      <div className="h-12 border-b border-[#2D2D2D] flex items-center px-4 justify-between bg-[#1E1E1E]">
        <div className="flex items-center space-x-4">
          <button className="hover:bg-[#2D2D2D] p-1.5 rounded">
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          <button className="flex items-center space-x-2 px-2 py-1 hover:bg-[#2D2D2D] rounded text-sm">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm ${
              activeTab === 'code' 
                ? 'bg-[#2D2D2D] text-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm ${
              activeTab === 'preview' 
                ? 'bg-[#2D2D2D] text-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="hover:bg-[#2D2D2D] p-1.5 rounded">
            <Terminal className="w-5 h-5 text-gray-400" />
          </button>
          <button className="hover:bg-[#2D2D2D] p-1.5 rounded">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Explorer */}
        <div className={`w-64 border-r border-[#2D2D2D] bg-[#1E1E1E] flex flex-col`}>
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <FileExplorer
                files={files}
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
              />
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="h-9 border-b border-[#2D2D2D] flex items-center px-4 bg-[#1E1E1E]">
            <div className="flex items-center space-x-2">
              {activeTab === 'code' ? (
                <>
                  <Code2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {selectedFile ? selectedFile.name : 'Select a file to edit'}
                  </span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Preview</span>
                </>
              )}
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
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

        {/* Right Sidebar - Steps */}
        <div className={`w-80 border-l border-[#2D2D2D] bg-[#1E1E1E] flex flex-col`}>
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <h2 className="text-sm font-medium text-gray-400 mb-4">Build Steps</h2>
              <StepsList 
                steps={steps} 
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}