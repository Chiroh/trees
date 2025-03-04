import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FileSystemNode } from '../types';

interface WindowType {
  id: string;
  title: string;
  file?: FileSystemNode;
  content?: ReactNode;
  icon?: ReactNode;
  isMinimized?: boolean;
}

interface WindowsContextType {
  openWindows: WindowType[];
  focusedWindowId: string | null;
  openWindow: (file: FileSystemNode) => void;
  openCustomWindow: (window: Omit<WindowType, 'isMinimized'>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
}

const WindowsContext = createContext<WindowsContextType | null>(null);

export const WindowsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openWindows, setOpenWindows] = useState<WindowType[]>([]);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);

  const openWindow = (file: FileSystemNode) => {
    const windowId = Math.random().toString(36).substr(2, 9);
    setOpenWindows(prev => [...prev, {
      id: windowId,
      title: file.name,
      file,
      isMinimized: false,
    }]);
    setFocusedWindowId(windowId);
  };

  const openCustomWindow = (window: Omit<WindowType, 'isMinimized'>) => {
    const existingWindow = openWindows.find(w => w.id === window.id);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        minimizeWindow(window.id);
      }
      focusWindow(window.id);
      return;
    }

    setOpenWindows(prev => [...prev, {
      ...window,
      isMinimized: false,
    }]);
    setFocusedWindowId(window.id);
  };

  const closeWindow = (id: string) => {
    setOpenWindows(prev => prev.filter(window => window.id !== id));
    if (focusedWindowId === id) {
      const remainingWindows = openWindows.filter(window => window.id !== id);
      setFocusedWindowId(remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1].id : null);
    }
  };

  const focusWindow = (id: string) => {
    setFocusedWindowId(id);
  };

  const minimizeWindow = (id: string) => {
    setOpenWindows(prev => prev.map(window => 
      window.id === id ? { ...window, isMinimized: !window.isMinimized } : window
    ));
    if (focusedWindowId === id) {
      const visibleWindows = openWindows.filter(window => !window.isMinimized && window.id !== id);
      setFocusedWindowId(visibleWindows.length > 0 ? visibleWindows[visibleWindows.length - 1].id : null);
    }
  };

  return (
    <WindowsContext.Provider value={{
      openWindows,
      focusedWindowId,
      openWindow,
      openCustomWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
    }}>
      {children}
    </WindowsContext.Provider>
  );
};

export const useWindows = () => {
  const context = useContext(WindowsContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowsProvider');
  }
  return context;
};