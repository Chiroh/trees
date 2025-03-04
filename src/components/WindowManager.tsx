import React from 'react';
import { Window } from './Window';
import { useWindows } from '../context/WindowsContext';

export const WindowManager: React.FC = () => {
  const { openWindows, closeWindow, focusedWindowId, minimizeWindow } = useWindows();

  return (
    <>
      {openWindows.map(window => (
        <Window
          key={window.id}
          file={window.file}
          title={window.title}
          icon={window.icon}
          content={window.content}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          isFocused={focusedWindowId === window.id}
          isMinimized={window.isMinimized}
        />
      ))}
    </>
  );
};