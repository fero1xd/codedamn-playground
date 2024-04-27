// These are shared types copied over.. maybe start a monorepo later

export interface Child extends Node {
  name: string;
  isDir: boolean;
  depth: number;
}

export interface Node {
  children: Child[];
  path: string;
}

export interface Root extends Node {}

export type FetchEvents = "GENERATE_TREE" | "FILE_CONTENT";

// From client -> server
export type WSEvents =
  | "TERMINAL_USER_CMD"
  | "TERMINAL_SESSION_START"
  | "SAVE_CHANGES";

// From client <- server
export type ServerEvent = "INSTALL_DEPS" | "TERMINAL_DATA" | "FILE_SAVED";

export type Dependencies = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};
