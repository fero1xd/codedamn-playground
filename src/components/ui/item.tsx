import { Child } from '@/queries';
import { useState } from 'react';
import { FolderClose, FolderOpen, TextDoc } from '../icons';

export function Item({ node }: { node: Child }) {
  const [expand, setExpand] = useState(false);

  return (
    <>
      <div className='flex flex-col px-2 gap-1'>
        <div
          className='flex items-center gap-2 cursor-pointer p-1 text-gray-300 hover:text-gray-500'
          onClick={() => {
            if (node.isDir) {
              setExpand((e) => !e);
            }
          }}
        >
          {node.isDir ? expand ? <FolderOpen /> : <FolderClose /> : <TextDoc />}
          <p className=''>{node.name}</p>
        </div>

        {node.isDir &&
          expand &&
          node.children.map((item) => {
            return <Item node={item} key={item.path} />;
          })}
      </div>
    </>
  );
}
