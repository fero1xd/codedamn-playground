// These are shared types copied over.. maybe start a monorepo later

export type Child = Node & {
  name: string;
  isDir: boolean;
  depth?: number;
};

export type Node = {
  children: Child[];
  path: string;
};

export type Root = Node;

export type WSEvents =
  | 'GENERATE_ROOT_TREE'
  | 'GENERATE_TREE'
  | 'TERMINAL_SESSION_START'
  | 'TERMINAL_USER_CMD';
