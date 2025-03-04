import React from 'react';
import { Taskbar } from './components/Taskbar';
import { Desktop } from './components/Desktop';
import { FileSystemProvider } from './context/FileSystemContext';
import { WindowsProvider } from './context/WindowsContext';

function App() {
  return (
    <FileSystemProvider>
      <WindowsProvider>
        <div className="h-screen w-screen overflow-hidden bg-[#0d5b9c] bg-gradient-to-br from-[#0d5b9c] to-[#0a4a80] text-white">
          <Desktop />
          <Taskbar />
        </div>
      </WindowsProvider>
    </FileSystemProvider>
  );
}

export default App;