import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, FileText, Save, Folder } from 'lucide-react';
import { FileSystemNode } from '../types';
import { useFileSystem } from '../context/FileSystemContext';
import { FileExplorer } from './FileExplorer';

interface WindowProps {
  file?: FileSystemNode;
  title?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  isFocused: boolean;
  isMinimized?: boolean;
}

export const Window: React.FC<WindowProps> = ({
  file,
  title,
  icon,
  content,
  onClose,
  onMinimize,
  isFocused,
  isMinimized
}) => {
  // Window State
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  
  // Interaction States
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Content States
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [contentState, setContentState] = useState('');
  
  // Refs
  const windowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Context
  const { updateNodeContent } = useFileSystem();

  // Effects
  useEffect(() => {
    if (file?.content !== undefined) {
      setContentState(file.content);
      setHasUnsavedChanges(false);
    }
  }, [file?.content]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing && !isMaximized) {
        const newWidth = Math.max(400, e.clientX - position.x);
        const newHeight = Math.max(300, e.clientY - position.y);
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, position.x, position.y, isMaximized]);

  // Event Handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMaximized) return;
    setIsResizing(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentState(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (file && contentState !== undefined) {
      updateNodeContent(file.id, contentState);
      setHasUnsavedChanges(false);
    }
  };

  const renderFileContent = () => (
    <div className="flex-1 flex flex-col">
      <textarea
        ref={textareaRef}
        value={contentState}
        onChange={handleContentChange}
        className="flex-1 bg-[#1a1a1a] text-white p-4 resize-none focus:outline-none font-mono"
      />
      {hasUnsavedChanges && (
        <button
          onClick={handleSave}
          className="absolute top-2 right-24 w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
        >
          <Save className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const renderFolderContent = () => (
    <FileExplorer 
      currentPath={file ? `${file.path}/${file.name}` : '/'} 
    />
  );

  const renderWindowContent = () => {
    if (content) {
      return content;
    }

    if (!file) {
      return null;
    }

    switch (file.type) {
      case 'file':
        return renderFileContent();
      case 'folder':
        return renderFolderContent();
      default:
        return null;
    }
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col ${
        isMaximized ? 'inset-0' : ''
      } bg-[#1a1a1a] border border-white/20 rounded-lg overflow-hidden shadow-xl ${
        isFocused ? 'z-50' : 'z-40'
      }`}
      style={isMaximized ? undefined : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      {/* Window Title Bar */}
      <div
        className="h-10 bg-[#2a2a2a] flex items-center px-3 gap-3 cursor-move"
        onMouseDown={handleDragStart}
      >
        {icon || (file?.type === 'folder' ? (
          <Folder className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        ))}
        <span className="flex-1 text-sm">{title || file?.name}</span>
        <button
          onClick={onMinimize}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Window Content */}
      {renderWindowContent()}

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};