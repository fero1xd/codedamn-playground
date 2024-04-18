export type Child = {
  name: string;
  isDir: boolean;
  path: string;
  children: Child[];
};
export type Root = Pick<Child, 'children'>;

const requestFileTree = async (conn: WebSocket) => {
  const nonce = 'sample_nonce';

  conn.send(
    JSON.stringify({
      nonce,
      event: 'FILE_TREE',
    })
  );

  console.log('resolved');
  return { children: [] } as Root;
};

export const queries = {
  file_tree: requestFileTree,
};

export type QueryKeys = keyof typeof queries;
