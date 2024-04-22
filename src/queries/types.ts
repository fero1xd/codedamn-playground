// These are shared types copied over.. maybe start a monorepo later

export interface Child extends Node {
  name: string;
  isDir: boolean;
  depth?: number;
}

export interface Node {
  children: Child[];
  path: string;
}

export interface Root extends Node {}

export type FetchEvents = 'GENERATE_TREE' | 'FILE_CONTENT';
export type WSEvents = 'TERMINAL_USER_CMD' | 'TERMINAL_SESSION_START';
