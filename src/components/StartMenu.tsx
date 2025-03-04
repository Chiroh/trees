import React from 'react';
import { User, HardDrive, Settings, Power } from 'lucide-react';
import { useWindows } from '../context/WindowsContext';

interface StartMenuProps {
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onClose }) => {
  const { openWindow } = useWindows();

  const handleFileExplorerClick = () => {
    openWindow({
      id: 'file-explorer',
      name: 'File Explorer',
      type: 'folder', 
      path: '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      metadata: {
        isSystem: true,
        permissions: {
          read: true,
          write: true,
          execute: true
        }
      }
    });
    onClose();
  };

  const handleSettingsClick = () => {
    openWindow({
      id: 'settings',
      name: 'Settings',
      type: 'folder',  // Geändert von 'system' zu 'folder'
      path: '/System',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      metadata: {
        isSystem: true,
        permissions: {
          read: true,
          write: true,
          execute: true
        }
      }
    });
    onClose();
  };

  const handlePowerClick = () => {
    // Hier könnte später ein Power-Menü implementiert werden
    onClose();
  };

  return (
    <div
      className="fixed bottom-12 left-0 w-80 bg-[#1a1a1a]/90 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 flex flex-col">
        {/* User Section */}
        <div className="p-2 flex items-center gap-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">User</span>
            <span className="text-xs text-white/60">Local Account</span>
          </div>
        </div>

        <div className="h-[1px] bg-white/10 my-2" />

        {/* Main Menu Items */}
        <button
          onClick={handleFileExplorerClick}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors w-full text-left"
        >
          <HardDrive className="w-5 h-5 text-white" />
          <span className="text-sm text-white">File Explorer</span>
        </button>

        <button
          onClick={handleSettingsClick}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors w-full text-left"
        >
          <Settings className="w-5 h-5 text-white" />
          <span className="text-sm text-white">Settings</span>
        </button>

        <div className="h-[1px] bg-white/10 my-2" />

        {/* Power Button */}
        <button
          onClick={handlePowerClick}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors w-full text-left text-red-400"
        >
          <Power className="w-5 h-5" />
          <span className="text-sm">Power</span>
        </button>
      </div>
    </div>
  );
};