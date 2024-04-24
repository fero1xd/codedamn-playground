export enum IncomingMessage {
  GENERATE_TREE = 'GENERATE_TREE',
  FILE_CONTENT = 'FILE_CONTENT',
  SAVE_CHANGES = 'SAVE_CHANGES',
  TERMINAL_SESSION_START = 'TERMINAL_SESSION_START',
  TERMINAL_USER_CMD = 'TERMINAL_USER_CMD',
  RESIZE_TERMINAL = 'RESIZE_TERMINAL',
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

export enum OutgoingMessageType {
  TERMINAL_DATA = 'TERMINAL_DATA',
  INSTALL_DEPS = 'INSTALL_DEPS',
}

export type ResponseType = {
  nonce?: string;
  serverEvent?: OutgoingMessageType;
  data: unknown;
};

export type Dependencies = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

export type PackageJSON = Dependencies & {
  // Types and typings are synonymous to each other
  typings?: string;
  types?: string;
};
