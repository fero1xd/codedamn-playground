import { useWSQuery } from '@/hooks/use-ws-query';
import { Item } from './ui/item';

export function FileTree() {
  const { data, isLoading } = useWSQuery('file_tree');

  if (isLoading || !data) {
    return <h1>Loading....</h1>;
  }

  return (
    <div className='h-full pt-4 flex flex-col'>
      {data.children.map((item) => {
        return <Item node={item} key={item.path} />;
      })}
    </div>
  );
}
