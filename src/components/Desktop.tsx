import React, { useRef, useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { useWindows } from '../context/WindowsContext';
import { DesktopIcon } from './DesktopIcon';
import { WindowManager } from './WindowManager';
import { ContextMenu } from './ContextMenu';
import { FileSystemNode } from '../types';

export const Desktop = () => {
  const fileSystem = useFileSystem();
  const { openWindow } = useWindows();
  const desktopRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file?: FileSystemNode;
    isCreating?: boolean;
    newFileType?: 'file' | 'folder' | 'tree';
    newFileName?: string;
  } | null>(null);

  const {
    getDesktopNodes,
    createNode,
    moveNode,
    deleteNode,
    renameNode,
    openNode,
    updateNodeMetadata
  } = fileSystem;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const rect = desktopRef.current?.getBoundingClientRect();
    if (rect) {
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 96));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 96));
      moveNode(data, '/Desktop', { x, y });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = desktopRef.current?.getBoundingClientRect();
    if (rect) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleFileContextMenu = (e: React.MouseEvent, file: FileSystemNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
  };

  const handleCreateFile = (name: string, type: 'file' | 'folder' | 'tree') => {
    if (contextMenu) {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (rect) {
        const x = Math.max(0, Math.min(contextMenu.x - rect.left, rect.width - 96));
        const y = Math.max(0, Math.min(contextMenu.y - rect.top, rect.height - 96));
        createNode(name, type, '/Desktop', {
          position: { x, y }
        });
        setContextMenu(null);
      }
    }
  };

  const handleCleanup = () => {
    const rect = desktopRef.current?.getBoundingClientRect();
    if (rect) {
      const desktopNodes = getDesktopNodes();
      const spacing = 96;
      const cols = Math.floor((rect.width - 20) / spacing);
      
      desktopNodes.forEach((node, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        updateNodeMetadata(node.id, {
          position: {
            x: 20 + col * spacing,
            y: 20 + row * spacing
          }
        });
      });
    }
    setContextMenu(null);
  };

  const handleOpenFile = (file: FileSystemNode) => {
    openNode(file.id);
    openWindow(file);
  };

  const desktopNodes = getDesktopNodes();

  return (
    <div
      ref={desktopRef}
      className="absolute inset-0 bottom-12 overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
    >
      {desktopNodes.map((node) => (
        <DesktopIcon
          key={node.id}
          file={node}
          onOpen={() => handleOpenFile(node)}
          onContextMenu={(e) => handleFileContextMenu(e, node)}
          containerRef={desktopRef}
        />
      ))}
      {contextMenu?.isCreating && contextMenu.newFileType && (
        <DesktopIcon
          file={{
            id: 'temp',
            name: contextMenu.newFileName || '',
            type: contextMenu.newFileType,
            path: '/Desktop',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            metadata: {
              position: {
                x: contextMenu.x - (desktopRef.current?.getBoundingClientRect().left || 0),
                y: contextMenu.y - (desktopRef.current?.getBoundingClientRect().top || 0)
              },
              permissions: {
                read: true,
                write: true,
                execute: false
              }
            }
          }}
          onOpen={() => {}}
          onContextMenu={() => {}}
          containerRef={desktopRef}
          isTemp
        />
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCreateFile={handleCreateFile}
          file={contextMenu.file}
          onDelete={deleteNode}
          onRename={renameNode}
          onOpen={handleOpenFile}
          onCleanup={handleCleanup}
          onCreating={(type, name) => setContextMenu(prev => prev ? {
            ...prev,
            isCreating: true,
            newFileType: type,
            newFileName: name
          } : null)}
        />
      )}
      <WindowManager />
    </div>
  );
};