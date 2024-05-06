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

export type FetchEvents =
  | "GENERATE_TREE"
  | "FILE_CONTENT"
  | "GET_PROJECT_FILES"
  | "TERMINAL_SESSION_START"
  | "GET_TYPINGS"
  | "GET_DEPS";

// From client -> server
export type WSEvents = "TERMINAL_USER_CMD" | "SAVE_CHANGES";

// From client <- server
export type ServerEvent =
  | "INSTALL_DEPS"
  | "TERMINAL_DATA"
  | "FILE_SAVED"
  | "ADD_FILE"
  | "REFETCH_DIR"
  | "REFRESH_IFRAME"
  | "PLAYGROUND_PAUSED";

export type Dependencies = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

export type ChangeEvent = {
  event: "add" | "unlink" | "addDir" | "unlinkDir" | "change";
  path: string;
};
