import { Conn } from '@/providers/ws';
import { v4 } from 'uuid';
import { Child, Root } from './types';

// 5 Seconds
const QUERY_TIMEOUT = 5 * 1000;

const requestFileTree = (conn: Conn, path?: string) => {
  const nonce = v4();
  const { addListener, sendJsonMessage } = conn;

  const p = new Promise<Root | Child>((res, rej) => {
    let timeout: NodeJS.Timeout | null = null;

    const removeListener = addListener(nonce, (data) => {
      console.log('resolved query with nonce ' + nonce);
      if (timeout) clearTimeout(timeout);

      removeListener();
      res(data as Root | Child);
    });

    timeout = setTimeout(() => {
      removeListener();
      rej('Query timed out');
    }, QUERY_TIMEOUT);
  });

  sendJsonMessage({
    nonce,
    event: path ? 'GENERATE_TREE' : 'GENERATE_ROOT_TREE',
    path: path || undefined,
  });

  return p;
};

export const queries = {
  GENERATE_ROOT_TREE: requestFileTree,
  GENERATE_TREE: requestFileTree,
};
