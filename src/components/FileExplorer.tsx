import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Folder, 
  GitFork, 
  LayoutGrid, 
  List, 
  Plus, 
  Trash2, 
  Pencil,
  Home,
  ChevronRight,
  Monitor,
  File,
  Download,
  Image,
  Music,
  Star
} from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';
import { useWindows } from '../context/WindowsContext';
import { FileSystemNode, ViewMode } from '../types';
import { ContextMenu } from './ContextMenu';

interface FileListItemProps {
  file: FileSystemNode;
  onOpen: (file: FileSystemNode) => void;
  viewMode: ViewMode;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onContextMenu: (e: React.MouseEvent, file: FileSystemNode) => void;
  isSelected?: boolean;
}

interface FileExplorerProps {
  currentPath: string;
}

interface BreadcrumbNavProps {
  path: string;
  onNavigate: (path: string) => void;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ path, onNavigate }) => {
  const pathParts = path.split('/').filter(Boolean);
  
  const handleClick = (index: number) => {
    const newPath = '/' + pathParts.slice(0, index + 1).join('/');
    onNavigate(newPath);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-[#2a2a2a] border-b border-white/20">
      <button 
        className="hover:bg-white/10 p-1 rounded flex items-center"
        onClick={() => onNavigate('/')}
      >
        <Home className="w-4 h-4" />
      </button>
      {pathParts.length > 0 && <ChevronRight className="w-4 h-4 text-white/40" />}
      {pathParts.map((part, index) => (
        <React.Fragment key={index}>
          <button 
            className="hover:bg-white/10 px-2 py-1 rounded text-sm flex items-center"
            onClick={() => handleClick(index)}
          >
            {part}
          </button>
          {index < pathParts.length - 1 && (
            <ChevronRight className="w-4 h-4 text-white/40" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const QuickAccessPanel: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const quickLinks = [
    { name: 'Desktop', path: '/Desktop', icon: <Monitor className="w-4 h-4" /> },
    { name: 'Documents', path: '/Documents', icon: <File className="w-4 h-4" /> },
    { name: 'Downloads', path: '/Downloads', icon: <Download className="w-4 h-4" /> },
    { name: 'Pictures', path: '/Pictures', icon: <Image className="w-4 h-4" /> },
    { name: 'Music', path: '/Music', icon: <Music className="w-4 h-4" /> }
  ];

  const favorites = [
    { name: 'Quick access', icon: <Star className="w-4 h-4" /> }
  ];

  return (
    <div className="w-48 border-r border-white/20 bg-[#1a1a1a] flex flex-col">
      <div className="p-2">
        <h3 className="text-sm font-medium text-white/60 px-2 py-1">Favorites</h3>
        {favorites.map(item => (
          <button
            key={item.name}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/10"
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-white/20">
        <h3 className="text-sm font-medium text-white/60 px-2 py-1">Quick Access</h3>
        {quickLinks.map(link => (
          <button
            key={link.name}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/10"
            onClick={() => onNavigate(link.path)}
          >
            {link.icon}
            <span className="text-sm">{link.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="p-2 border-t border-white/20">
        <h3 className="text-sm font-medium text-white/60 px-2 py-1">This PC</h3>
        <button
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/10"
          onClick={() => onNavigate('/')}
        >
          <Monitor className="w-4 h-4" />
          <span className="text-sm">Local Disk (C:)</span>
        </button>
      </div>
    </div>
  );
};

const FileListItem: React.FC<FileListItemProps> = ({ 
  file, 
  viewMode, 
  onOpen, 
  onDelete, 
  onRename,
  onContextMenu 
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const handleRename = () => {
    if (onRename && newName.trim() !== '' && newName !== file.name) {
      onRename(file.id, newName);
    }
    setIsRenaming(false);
  };

  const getIcon = () => {
    switch (file.type) {
      case 'folder':
        return <Folder className="w-5 h-5 text-yellow-400" />;
      case 'tree':
        return <GitFork className="w-5 h-5 text-green-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  if (viewMode === 'grid') {
    return (
      <div 
        className="w-24 flex flex-col items-center gap-2 p-2 rounded hover:bg-white/10 cursor-pointer group"
        onClick={() => !isRenaming && onOpen(file)}
        onContextMenu={(e) => onContextMenu(e, file)}
      >
 {getIcon()}
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                setNewName(file.name);
              }
            }}
            className="w-full text-sm text-center bg-transparent outline-none border-b border-white/20"
            autoFocus
          />
        ) : (
          <span 
            className="text-sm text-center truncate w-full"
            onDoubleClick={() => setIsRenaming(true)}
          >
            {file.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 p-2 hover:bg-white/10 cursor-pointer group"
      onContextMenu={(e) => onContextMenu(e, file)}
    >
      {getIcon()}
      {isRenaming ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') {
              setIsRenaming(false);
              setNewName(file.name);
            }
          }}
          className="flex-1 bg-transparent outline-none border-b border-white/20"
          autoFocus
        />
      ) : (
        <>
          <span 
            className="flex-1" 
            onClick={() => onOpen(file)}
            onDoubleClick={() => setIsRenaming(true)}
          >
            {file.name}
          </span>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <button
              onClick={() => setIsRenaming(true)}
              className="p-1 rounded hover:bg-white/20"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(file.id)}
                className="p-1 rounded hover:bg-white/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ currentPath = '/' }) => {
  const { getNodesByPath, createNode, deleteNode, renameNode } = useFileSystem();
  const { openWindow } = useWindows();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isCreatingFile, setIsCreatingFile] = useState<'file' | 'folder' | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState(currentPath);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file?: FileSystemNode;
  } | null>(null);
  const [clipboardNode, setClipboardNode] = useState<{
    node: FileSystemNode;
    operation: 'copy' | 'cut';
  } | null>(null);

  const fileListRef = useRef<HTMLDivElement>(null);
  const nodes = getNodesByPath(currentDirectory) || [];
  const currentNodes = nodes.filter(node => !node.metadata?.isHidden);

  const renderNewFileInput = () => {
    if (!isCreatingFile) return null;

    const icon = isCreatingFile === 'folder' 
      ? <Folder className="w-5 h-5 text-yellow-400" />
      : <FileText className="w-5 h-5 text-blue-400" />;

    return (
      <div 
        className={
          viewMode === 'grid' 
            ? "w-24 flex flex-col items-center gap-2 p-2" 
            : "flex items-center gap-2 p-2"
        }
      >
        {icon}
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder={`New ${isCreatingFile}...`}
          className={`
            bg-transparent outline-none border-b border-white/20
            ${viewMode === 'grid' ? 'w-full text-sm text-center' : 'flex-1'}
          `}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newFileName.trim()) {
              handleFileCreate(newFileName, isCreatingFile);
            } else if (e.key === 'Escape') {
              setIsCreatingFile(null);
              setNewFileName('');
            }
          }}
          onBlur={() => {
            if (newFileName.trim()) {
              handleFileCreate(newFileName, isCreatingFile);
            } else {
              setIsCreatingFile(null);
              setNewFileName('');
            }
          }}
        />
      </div>
    );
  };

// Hier den neuen useEffect einfügen
useEffect(() => {
  const handleGlobalClick = () => {
    if (contextMenu) {
      setContextMenu(null);
    }
    if (isCreatingFile) {
      setIsCreatingFile(null);
      setNewFileName('');
    }
  };

  window.addEventListener('click', handleGlobalClick);
  return () => window.removeEventListener('click', handleGlobalClick);
}, [contextMenu, isCreatingFile]);

  const handleNavigate = (path: string) => {
    setCurrentDirectory(path);
  };

  const handleFileOpen = (file: FileSystemNode) => {
    if (file.type === 'folder') {
      setCurrentDirectory(`${currentDirectory}/${file.name}`.replace('//', '/'));
    } else {
      openWindow(file);
    }
  };

  const handleFileCreate = (name: string, type: 'file' | 'folder' | 'tree') => {
    if (name.trim()) {
      createNode(name, type, currentDirectory);
      setContextMenu(null);
      setIsCreatingFile(null);
      setNewFileName('');
    }
  };


  
  const handleContextMenu = (e: React.MouseEvent, file?: FileSystemNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
  };

  const handleCopy = (file: FileSystemNode) => {
    setClipboardNode({ node: file, operation: 'copy' });
    setContextMenu(null);
  };

  const handleCut = (file: FileSystemNode) => {
    setClipboardNode({ node: file, operation: 'cut' });
    setContextMenu(null);
  };

  const handlePaste = () => {
    if (clipboardNode) {
      const { node, operation } = clipboardNode;
      if (operation === 'copy') {
        createNode(node.name, node.type, currentDirectory, node.metadata);
      } else {
        renameNode(node.id, `${currentDirectory}/${node.name}`);
      }
      setClipboardNode(null);
    }
  };

  return (
    <div className="flex-1 flex bg-[#1a1a1a] text-white">
      <QuickAccessPanel onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col relative">
        <BreadcrumbNav path={currentDirectory} onNavigate={handleNavigate} />
        
        <div className="flex items-center gap-2 p-2 border-b border-white/20">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              setIsCreatingFile('file');
              setNewFileName('');
            }}
            className="p-1.5 rounded hover:bg-white/10"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div 
          ref={fileListRef}
          className={`flex-1 overflow-auto ${viewMode === 'grid' ? 'p-4' : ''} relative`}
          onContextMenu={(e) => handleContextMenu(e)}
        >
          <div className={viewMode === 'grid' ? 'flex flex-wrap gap-4' : ''}>
            {renderNewFileInput()}
            {currentNodes.map((node) => (
              <FileListItem
                key={node.id}
                file={node}
                onOpen={handleFileOpen}
                viewMode={viewMode}
                onDelete={deleteNode}
                onRename={renameNode}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>

          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              onCreateFile={handleFileCreate}
              file={contextMenu.file}
              onDelete={deleteNode}
              onRename={renameNode}
              onOpen={handleFileOpen}
              onCopy={handleCopy}
              onCut={handleCut}
              onPaste={handlePaste}
              canPaste={!!clipboardNode}
              isFileExplorer={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};