import { Child, Node } from '@/queries/types';
import { getIcon } from './icons';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function Children({
  node,
  onSelect,
}: {
  node: Node;
  onSelect: (node: Child) => void;
}) {
  const [open, setOpen] = useState(false);

  return node.children.map((c) => (
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
          `${Math.random() > 2 ? 'bg-[#242424]' : 'bg-transparent'} hover:cursor-pointer hover:bg-[#0f111a]`
        )}
        style={{ paddingLeft: `${c.depth! * 16}px` }}
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
        <Children key={c.path + Math.random()} node={c} onSelect={onSelect} />
      )}
    </>
  ));
}
