import React, { useEffect, useState } from 'react';
import { FileText, Folder, GitFork } from 'lucide-react';
import { FileSystemNode } from '../types';

interface DesktopIconProps {
  file: FileSystemNode;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  isTemp?: boolean;
  isRenaming?: boolean;
  onRename?: (newName: string) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  file,
  onOpen,
  onContextMenu,
  containerRef,
  isTemp = false,
  isRenaming = false,
  onRename
}) => {
  const [position, setPosition] = useState(file.metadata.position || { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editName, setEditName] = useState(file.name);

  const handleDragStart = (e: React.MouseEvent) => {
    if (isTemp || isRenaming) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !containerRef?.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    // Constrain to container bounds
    const maxX = containerRect.width - 96;
    const maxY = containerRect.height - 96;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  useEffect(() => {
    if (file.metadata.position) {
      setPosition(file.metadata.position);
    }
  }, [file.metadata.position]);

  const getIcon = () => {
    switch (file.type) {
      case 'folder':
        return <Folder className="w-12 h-12 text-yellow-400" />;
      case 'tree':
        return <GitFork className="w-12 h-12 text-green-400" />;
      default:
        return <FileText className="w-12 h-12 text-blue-400" />;
    }
  };

  return (
    <div
      className={`absolute flex flex-col items-center w-24 p-2 rounded hover:bg-white/10 cursor-pointer group ${
        isTemp ? 'pointer-events-none opacity-50' : ''
      }`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleDragStart}
      onDoubleClick={() => !isRenaming && onOpen()}
      onContextMenu={onContextMenu}
    >
      {getIcon()}
      <div className="w-full mt-1 min-h-[1.5rem] flex items-center justify-center">
        {isRenaming ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRename?.(editName);
              if (e.key === 'Escape') onRename?.(file.name);
            }}
            onBlur={() => onRename?.(editName)}
            className="w-full text-sm text-center bg-transparent outline-none border-b border-white/20 text-white"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm text-center break-words text-white drop-shadow-lg">
            {file.name}
          </span>
   )}
   </div>
 </div>
);
};