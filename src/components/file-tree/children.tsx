import { Child, Node } from '@/queries/types';
import { getIcon } from './icons';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useWSQuery } from '@/hooks/use-ws-query';

type ChildrenProps = {
  node: Node;
  selectedDir: Child | undefined;
  selectedFile: Child | undefined;
  onSelect: (node: Child) => void;
};

export function Children({
  node,
  onSelect,
  selectedDir,
  selectedFile,
}: ChildrenProps) {
  return node.children.map((c) => (
    <Item
      key={c.path + '/' + c.name}
      node={c}
      selectedDir={selectedDir}
      onSelect={onSelect}
      selectedFile={selectedFile}
    />
  ));
}

type ItemProps = ChildrenProps & {
  node: Child;
};

function Item({ node, selectedDir, onSelect, selectedFile }: ItemProps) {
  const [open, setOpen] = useState(false);
  const path = node.path;
  const isSelected = selectedFile
    ? selectedFile.path === path
    : selectedDir?.path === path;

  return (
    <>
      <div
        key={node.path}
        onClick={() => {
          if (node.isDir) {
            setOpen((o) => !o);
          }
          onSelect(node);
        }}
        className={cn(
          `flex items-center transition-all ease-out`,
          `${isSelected ? 'bg-[#020509]' : 'bg-transparent'} hover:cursor-pointer hover:bg-[#020509]`
        )}
        style={{ paddingLeft: `${node.depth * 16}px` }}
      >
        <span className='flex w-[32px] h-[32px] items-center justify-center'>
          {getIcon(
            node.name.split('.').pop() || '',
            node.isDir ? 'closedDirectory' : '',
            node.name
          )}
        </span>

        <span style={{ marginLeft: 1, marginBottom: 3 }}>{node.name}</span>
      </div>

      {open && node.isDir && (
        <Nested
          node={node}
          onSelect={onSelect}
          selectedDir={selectedDir}
          selectedFile={selectedFile}
        />
      )}
    </>
  );
}

function Nested({ node: dir, onSelect, selectedDir, selectedFile }: ItemProps) {
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
  }, [data, dir]);

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
      selectedFile={selectedFile}
    />
  );
}
