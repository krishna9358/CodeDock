import React, { useState } from 'react';
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
      const paddingLeft = `${level * 1.25}rem`;
      const isFolder = item.type === 'folder';
      const hasChildren = isFolder && item.children && item.children.length > 0;

      if (isFolder) {
        return (
          <div key={item.path} className="group">
            <button
              onClick={() => toggleFolder(item.path)}
              className={`w-full flex items-center px-2 py-1.5 rounded-lg transition-all duration-200 ${
                isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-gray-800/50 text-gray-300'
              }`}
              style={{ paddingLeft }}
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="mr-1 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                  )}
                </div>
                <Folder className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-400" />
                <span className="truncate">{item.name}</span>
                {hasChildren && (
                  <span className="ml-2 text-xs text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded-full">
                    {item.children?.length}
                  </span>
                )}
              </div>
            </button>
            {isExpanded && item.children && (
              <div className="mt-1">
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
          className={`w-full flex items-center px-2 py-1.5 rounded-lg transition-all duration-200 ${
            isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-gray-800/50 text-gray-300'
          }`}
          style={{ paddingLeft: `calc(${paddingLeft} + 1.25rem)` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {getFileIcon(item.name)}
            <span className="ml-2 truncate">{item.name}</span>
          </div>
        </button>
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {renderFileTree(files)}
      </div>
    </div>
  );
}