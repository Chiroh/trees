import React, { useState } from 'react';
import { Trees as Tree, FileText, Folder, GitFork, HardDrive } from 'lucide-react';
import { StartMenu } from './StartMenu';
import { useWindows } from '../context/WindowsContext';
import { useFileSystem } from '../context/FileSystemContext';
import { FileExplorer } from './FileExplorer';

export const Taskbar = () => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const { openWindows, focusWindow, minimizeWindow, openCustomWindow } = useWindows();

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (showStartMenu) {
      setShowStartMenu(false);
    }
  };

  const handleOpenFiles = () => {
    openCustomWindow({
      id: 'file-explorer',
      title: 'File Explorer',
      content: <FileExplorer />,
      icon: <HardDrive className="w-4 h-4" />
    });
    setShowStartMenu(false);
  };

  const getWindowIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-4 h-4" />;
      case 'tree':
        return <GitFork className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <>
      {showStartMenu && (
        <div className="fixed inset-0 z-40" onClick={handleGlobalClick}>
          <StartMenu onClose={() => setShowStartMenu(false)} onOpenFiles={handleOpenFiles} />
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#1a1a1a]/90 backdrop-blur-lg border-t border-white/20 flex items-center px-2 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStartMenu(!showStartMenu);
          }}
          className="p-2 rounded hover:bg-white/10 transition-colors"
        >
          <Tree className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center gap-1 ml-2">
          {openWindows.map(window => (
            <button
              key={window.id}
              onClick={() => {
                if (window.isMinimized) {
                  minimizeWindow(window.id);
                }
                focusWindow(window.id);
              }}
              className={`h-8 px-3 rounded flex items-center gap-2 hover:bg-white/10 transition-colors ${
                window.isMinimized ? 'opacity-50' : ''
              }`}
            >
              {window.icon || getWindowIcon(window.file?.type || 'file')}
              <span className="text-sm truncate max-w-[150px]">
                {window.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};