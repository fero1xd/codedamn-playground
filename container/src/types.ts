import type WebSocket from "ws";

export enum IncomingMessage {
  GENERATE_TREE = "GENERATE_TREE",
  FILE_CONTENT = "FILE_CONTENT",
  SAVE_CHANGES = "SAVE_CHANGES",
  TERMINAL_SESSION_START = "TERMINAL_SESSION_START",
  TERMINAL_USER_CMD = "TERMINAL_USER_CMD",
  RESIZE_TERMINAL = "RESIZE_TERMINAL",
  GET_PROJECT_FILES = "GET_PROJECT_FILES",

  GET_TYPINGS = "GET_TYPINGS",
  GET_DEPS = "GET_DEPS",
}

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

export enum OutgoingMessageType {
  TERMINAL_DATA = "TERMINAL_DATA",
  INSTALL_DEPS = "INSTALL_DEPS",
  FILE_SAVED = "FILE_SAVED",
  ADD_FILE = "ADD_FILE",
  REFETCH_DIR = "REFETCH_DIR",
  REFRESH_IFRAME = "REFRESH_IFRAME",
  PLAYGROUND_PAUSED = "PLAYGROUND_PAUSED",
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

export type WebSocketWithKeepAlive = WebSocket & {
  isAlive: boolean;
};
