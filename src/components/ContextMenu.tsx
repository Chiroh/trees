import React, { useState, useEffect, useRef } from 'react';
import { FileText, Folder, GitFork, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { FileSystemNode } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCreateFile?: (name: string, type: 'file' | 'folder' | 'tree') => void;
  file?: FileSystemNode;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onOpen?: (file: FileSystemNode) => void;
  onCleanup?: () => void;
  onCreating?: (type: 'file' | 'folder' | 'tree', name: string) => void;
  onCopy?: (file: FileSystemNode) => void;
  onCut?: (file: FileSystemNode) => void;
  onPaste?: () => void;
  canPaste?: boolean;
  isFileExplorer?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onCreateFile,
  file,
  onDelete,
  onRename,
  onOpen,
  onCleanup,
  onCreating,
  onCopy,
  onCut,
  onPaste,
  canPaste,
  isFileExplorer
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState(file?.name || '');
  const [newFileType, setNewFileType] = useState<'file' | 'folder' | 'tree' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateFile = (type: 'file' | 'folder' | 'tree') => {
    const name = type === 'file' ? 'New Text Document' : type === 'folder' ? 'New Folder' : 'New Tree';
    setNewFileType(type);
    setNewFileName(name);
    setIsCreating(true);
    onCreating?.(type, name);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCreating, isRenaming]);

  return (
    <div
      className="fixed bg-[#1a1a1a]/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl py-1 z-50"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {file ? (
        <>
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && file) {
                  onRename?.(file.id, newFileName);
                  onClose();
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              className="w-full px-2 py-1 bg-transparent outline-none border-b border-white/20 text-white text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <button
                onClick={() => onOpen?.(file)}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open</span>
              </button>
              {isFileExplorer && (
                <>
                  <button
                    onClick={() => onCopy?.(file)}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => onCut?.(file)}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cut</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setIsRenaming(true)}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
              >
                <Pencil className="w-4 h-4" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => onDelete?.(file.id)}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          )}
        </>
      ) : (
        <>
          {isCreating && newFileType ? (
            <input
              ref={inputRef}
              type="text"
              value={newFileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
                onCreating?.(newFileType, e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFileType) {
                  onCreateFile?.(newFileName, newFileType);
                  onClose();
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              className="w-full px-2 py-1 bg-transparent outline-none border-b border-white/20 text-white text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <button
                onClick={() => handleCreateFile('file')}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
              >
                <FileText className="w-4 h-4" />
                <span>New File</span>
              </button>
              <button
                onClick={() => handleCreateFile('folder')}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
              >
                <Folder className="w-4 h-4" />
                <span>New Folder</span>
              </button>
              <button
                onClick={() => handleCreateFile('tree')}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
              >
                <GitFork className="w-4 h-4" />
                <span>New Tree</span>
              </button>
              {!isFileExplorer && (
                <button
                  onClick={onCleanup}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
                >
                  <GitFork className="w-4 h-4" />
                  <span>Clean Up</span>
                </button>
              )}
              {isFileExplorer && canPaste && (
                <button
                  onClick={onPaste}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10"
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste</span>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};