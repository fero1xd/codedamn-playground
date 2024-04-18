export enum IncomingMessage {
  FILE_TREE = 'FILE_TREE',
  FILE_CONTENT = 'FILE_CONTENT',
  SAVE_CHANGES = 'SAVE_CHANGES',
}

export type Child = {
  name: string;
  isDir: boolean;
  path: string;
  children: Child[];
};
export type Root = Pick<Child, 'children'>;

export type ResponseType = {
  nonce: string;
  data: unknown;
};
