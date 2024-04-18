import { Conn } from '@/providers/ws';
import { v4 } from 'uuid';

export type Child = {
  name: string;
  isDir: boolean;
  path: string;
  children: Child[];
};
export type Root = Pick<Child, 'children'>;

const requestFileTree = (conn: Conn) => {
  const nonce = v4();
  const { ws, addListener } = conn;

  ws.send(
    JSON.stringify({
      nonce,
      event: 'FILE_TREE',
    })
  );

  return new Promise<Root>((res) => {
    addListener(nonce, (data) => {
      console.log('resolved');
      res(data as Root);
    });
  });
};

export const queries = {
  file_tree: requestFileTree,
};

export type QueryKeys = keyof typeof queries;
