import { Child, Node } from '@/queries/types';
import { getIcon } from './icons';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useWSQuery } from '@/hooks/use-ws-query';

export function Children({
  node,
  onSelect,
  selectedDir,
}: {
  node: Node;
  selectedDir?: Child;
  onSelect: (node: Child) => void;
}) {
  return node.children.map((c) => (
    <Item
      key={c.path + '/' + c.name}
      c={c}
      selectedDir={selectedDir}
      onSelect={onSelect}
    />
  ));
}

function Item({
  c,
  selectedDir,
  onSelect,
}: {
  c: Child;
  selectedDir?: Child;
  onSelect: (node: Child) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        key={c.path}
        onClick={() => {
          if (c.isDir) {
            setOpen((o) => !o);
          }
          onSelect(c);
        }}
        className={cn(
          `flex items-center`,
          `${selectedDir && selectedDir.path === c.path ? 'bg-[#242424]' : 'bg-transparent'} hover:cursor-pointer hover:bg-[#0f111a]`
        )}
        style={{ paddingLeft: `${c.depth * 16}px` }}
      >
        <span className='flex w-[32px] h-[32px] items-center justify-center'>
          {getIcon(
            c.name.split('.').pop() || '',
            c.isDir ? 'closedDirectory' : '',
            c.name
          )}
        </span>

        <span style={{ marginLeft: 1, marginBottom: 3 }}>{c.name}</span>
      </div>

      {open && c.isDir && (
        <Nested node={c} onSelect={onSelect} selectedDir={selectedDir} />
      )}
    </>
  );
}

function Nested({
  node: dir,
  onSelect,
  selectedDir,
}: {
  node: Child;
  onSelect: (node: Child) => void;
  selectedDir?: Child;
}) {
  const { data, isLoading } = useWSQuery(
    ['GENERATE_TREE', dir.path],
    120 * 1000
  );

  const useFullData = useMemo(() => {
    if (data) {
      console.log('nested', dir.path, dir.name);
      const cloned = { ...data };

      cloned.children.forEach((c) => {
        c.depth = (dir.depth !== undefined ? dir.depth : 0) + 1;
      });

      return cloned;
    }
  }, [data, dir.depth]);

  if (isLoading) {
    // Maybe query is still loading..
    return null;
  }

  if (!data || !useFullData) {
    return <p>error fetching contents for {dir.path}</p>;
  }

  return (
    <Children
      key={dir.path + Math.random()}
      node={useFullData}
      onSelect={onSelect}
      selectedDir={selectedDir}
    />
  );
}
