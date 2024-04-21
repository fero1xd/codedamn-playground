export enum IncomingMessage {
  GENERATE_ROOT_TREE = 'GENERATE_ROOT_TREE',
  GENERATE_TREE = 'GENERATE_TREE',
  FILE_CONTENT = 'FILE_CONTENT',
  SAVE_CHANGES = 'SAVE_CHANGES',
}

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

export type ResponseType = {
  nonce: string;
  data: unknown;
};
