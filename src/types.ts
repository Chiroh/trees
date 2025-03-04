export type FileType = 'file' | 'folder' | 'tree';
export type ViewMode = 'list' | 'grid' | 'details';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileType;
  path: string;
  content?: string;
  size?: number;
  createdAt: string;
  modifiedAt: string;
  metadata: {
    position?: {
      x: number;
      y: number;
    };
    isSystem?: boolean;
    isHidden?: boolean;
    permissions: {
      read: boolean;
      write: boolean;
      execute: boolean;
    };
  };
}

export interface SystemPaths {
  ROOT: string;
  DESKTOP: string;
  DOCUMENTS: string;
  DOWNLOADS: string;
  PICTURES: string;
  SYSTEM: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}