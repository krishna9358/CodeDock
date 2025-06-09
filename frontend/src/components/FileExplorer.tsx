import React, { useState, useEffect } from 'react';
import { FileItem } from '../types';
import { ChevronRight, ChevronDown, File, Folder, FileCode, FileJson, FileType, FileText, Search } from 'lucide-react';

interface FileExplorerProps {
  files: FileItem[];
  selectedFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
}

export function FileExplorer({ files, selectedFile, onFileSelect }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-expand folders and select files when they're generated
  useEffect(() => {
    const expandPath = (path: string) => {
      const parts = path.split('/');
      let currentPath = '';
      
      // Expand all parent folders
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += (i === 0 ? '' : '/') + parts[i];
        setExpandedFolders(prev => new Set([...prev, currentPath]));
      }
    };

    // If there's a selected file, ensure its path is expanded
    if (selectedFile) {
      expandPath(selectedFile.path);
    }
  }, [selectedFile]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-400" />;
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return <FileType className="w-4 h-4 text-pink-400" />;
      case 'html':
      case 'htm':
        return <FileType className="w-4 h-4 text-orange-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const filterFiles = (items: FileItem[]): FileItem[] => {
    if (!searchTerm) return items;
    
    return items.filter(item => {
      if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      
      if (item.type === 'folder' && item.children) {
        const filteredChildren = filterFiles(item.children);
        if (filteredChildren.length > 0) {
          return true;
        }
      }
      
      return false;
    });
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    const filteredItems = filterFiles(items);
    
    return filteredItems.map((item) => {
      const isExpanded = expandedFolders.has(item.path);
      const isSelected = selectedFile?.path === item.path;
      const paddingLeft = `${level * 0.75}rem`;
      const isFolder = item.type === 'folder';

      if (isFolder) {
        return (
          <div key={item.path} className="group">
            <button
              onClick={() => toggleFolder(item.path)}
              className={`w-full flex items-center h-7 text-sm transition-colors ${
                isSelected ? 'bg-secondary text-secondary-foreground' : 'hover:bg-secondary/50 text-muted-foreground'
              }`}
              style={{ paddingLeft }}
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="mr-1 flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
                <Folder className="w-4 h-4 mr-1.5 flex-shrink-0 text-blue-400" />
                <span className="truncate text-inherit">{item.name}</span>
              </div>
            </button>
            {isExpanded && item.children && (
              <div className="animate-in slide-in-from-left-1">
                {renderFileTree(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={item.path}
          onClick={() => onFileSelect(item)}
          className={`w-full flex items-center h-7 text-sm transition-colors ${
            isSelected ? 'bg-secondary text-secondary-foreground' : 'hover:bg-secondary/50 text-muted-foreground'
          }`}
          style={{ paddingLeft: `calc(${paddingLeft} + 1rem)` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-4 h-4 mr-1.5 flex-shrink-0">
              {getFileIcon(item.name)}
            </div>
            <span className="truncate text-inherit">{item.name}</span>
          </div>
        </button>
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        <h2 className="px-2 py-1 text-[11px] font-medium uppercase text-muted-foreground/70">Explorer</h2>
      </div>
      
      {/* Search Bar */}
      <div className="px-2 mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <Search className="h-3 w-3 text-muted-foreground/70" />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-secondary/50 text-xs text-foreground placeholder-muted-foreground/70 rounded-md border border-transparent focus:outline-none focus:border-ring focus:bg-secondary/70 transition-colors"
          />
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {renderFileTree(files)}
      </div>
    </div>
  );
}