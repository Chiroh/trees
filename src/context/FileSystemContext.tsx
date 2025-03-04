import React, { createContext, useContext, useState } from 'react';
import { FileSystemNode, SystemPaths } from '../types';

interface FileSystemContextType {
  nodes: FileSystemNode[];
  createNode: (name: string, type: 'file' | 'folder' | 'tree', parentPath: string, metadata?: Partial<FileSystemNode['metadata']>) => FileSystemNode;
  deleteNode: (id: string) => void;
  moveNode: (id: string, newParentPath: string, position?: { x: number; y: number }) => void;
  renameNode: (id: string, newName: string) => void;
  updateNodeContent: (id: string, content: string) => void;
  updateNodeMetadata: (id: string, metadata: Partial<FileSystemNode['metadata']>) => void;
  getNodesByPath: (path: string) => FileSystemNode[];
  getNodeById: (id: string) => FileSystemNode | undefined;
  getDesktopNodes: () => FileSystemNode[];
  openedNodes: string[];
  openNode: (id: string) => void;
  closeNode: (id: string) => void;
}

export const SYSTEM_PATHS: SystemPaths = {
  ROOT: '/',
  DESKTOP: '/Desktop',
  DOCUMENTS: '/Documents',
  DOWNLOADS: '/Downloads',
  PICTURES: '/Pictures',
  SYSTEM: '/System'
};

const initialNodes: FileSystemNode[] = [
  {
    id: 'root',
    name: 'Root',
    type: 'folder',
    path: '/',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    metadata: {
      isSystem: true,
      isHidden: true,
      permissions: {
        read: true,
        write: true,
        execute: true
      }
    }
  },
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    path: '/',
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
  },
  {
    id: 'welcome',
    name: 'Welcome.txt',
    type: 'file',
    path: '/Desktop',
    content: 'Welcome to Tree\'s OS!\n\nThis is your personal workspace.',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    metadata: {
      position: { x: 20, y: 20 },
      permissions: {
        read: true,
        write: true,
        execute: false
      }
    }
  }
];

export const FileSystemContext = createContext<FileSystemContextType | null>(null);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<FileSystemNode[]>(initialNodes);
  const [openedNodes, setOpenedNodes] = useState<string[]>([]);

  const createNode = (
    name: string,
    type: 'file' | 'folder' | 'tree',
    parentPath: string,
    metadata?: Partial<FileSystemNode['metadata']>
  ): FileSystemNode => {
    const newNode: FileSystemNode = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      path: parentPath,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      metadata: {
        permissions: {
          read: true,
          write: true,
          execute: type === 'folder' || type === 'tree'
        },
        ...metadata
      }
    };
    setNodes(prev => [...prev, newNode]);
    return newNode;
  };

  const deleteNode = (id: string) => {
    setNodes(prev => {
      const nodeToDelete = prev.find(n => n.id === id);
      if (!nodeToDelete) return prev;
      
      const nodesToDelete = new Set<string>([id]);
      if (nodeToDelete.type === 'folder') {
        prev.forEach(node => {
          if (node.path.startsWith(`${nodeToDelete.path}/${nodeToDelete.name}`)) {
            nodesToDelete.add(node.id);
          }
        });
      }
      return prev.filter(node => !nodesToDelete.has(node.id));
    });
  };

  const moveNode = (id: string, newParentPath: string, position?: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => {
      if (node.id === id) {
        return {
          ...node,
          path: newParentPath,
          metadata: {
            ...node.metadata,
            position: position || node.metadata.position
          }
        };
      }
      return node;
    }));
  };

  const renameNode = (id: string, newName: string) => {
    setNodes(prev => {
      const nodeToRename = prev.find(n => n.id === id);
      if (!nodeToRename) return prev;

      const oldPath = `${nodeToRename.path}/${nodeToRename.name}`;
      const newPath = `${nodeToRename.path}/${newName}`;

      return prev.map(node => {
        if (node.id === id) {
          return { ...node, name: newName, modifiedAt: new Date().toISOString() };
        }
        if (node.path.startsWith(oldPath)) {
          return { ...node, path: node.path.replace(oldPath, newPath) };
        }
        return node;
      });
    });
  };

  const updateNodeContent = (id: string, content: string) => {
    setNodes(prev => prev.map(node =>
      node.id === id ? { ...node, content, modifiedAt: new Date().toISOString() } : node
    ));
  };

  const updateNodeMetadata = (id: string, metadata: Partial<FileSystemNode['metadata']>) => {
    setNodes(prev => prev.map(node =>
      node.id === id ? {
        ...node,
        metadata: { ...node.metadata, ...metadata },
        modifiedAt: new Date().toISOString()
      } : node
    ));
  };

  const getNodesByPath = (path: string) => {
    return nodes.filter(node => node.path === path);
  };

  const getNodeById = (id: string) => {
    return nodes.find(node => node.id === id);
  };

  const getDesktopNodes = () => {
    return nodes.filter(node => node.path === '/Desktop');
  };

  const openNode = (id: string) => {
    if (!openedNodes.includes(id)) {
      setOpenedNodes(prev => [...prev, id]);
    }
  };

  const closeNode = (id: string) => {
    setOpenedNodes(prev => prev.filter(nodeId => nodeId !== id));
  };

  const contextValue: FileSystemContextType = {
    nodes,
    createNode,
    deleteNode,
    moveNode,
    renameNode,
    updateNodeContent,
    updateNodeMetadata,
    getNodesByPath,
    getNodeById,
    getDesktopNodes,
    openedNodes,
    openNode,
    closeNode
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};