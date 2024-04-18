import { useWSQuery } from '@/hooks/use-ws-query';

export function FileTree() {
  const { data } = useWSQuery('file_tree');

  return (
    <div className='h-full'>{!data ? 'Loading....' : JSON.stringify(data)}</div>
  );
}
