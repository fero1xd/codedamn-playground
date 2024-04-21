import { Child, Node, Root } from '@/queries/types';
import { useMemo } from 'react';
import { Children } from './children';
import { useQueryClient } from '@tanstack/react-query';
import { useWSQuery } from '@/hooks/use-ws-query';
import path from 'path';

const addDepth = (children: Child[], currentDepth: number) => {
  children.forEach((i) => {
    i.depth = currentDepth + 1;

    if (i.isDir) {
      addDepth(i.children, currentDepth + 1);
    }
  });
};

export function FileTree() {
  const { data: treeRoot, isLoading } = useWSQuery('GENERATE_ROOT_TREE');

  const queryClient = useQueryClient();

  useMemo(() => {
    if (treeRoot) {
      // Later improve this by only giving changed portion of the tree and avoid recalculating depth for each element
      console.log('calculating depth');
      addDepth(treeRoot.children, 0);

      queryClient.setQueryData(['GENERATE_ROOT_TREE'], treeRoot);
    }
  }, [treeRoot, queryClient]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!treeRoot) {
    return <p>Error fetching workdir</p>;
  }

  const onSelect = (child: Child) => {
    console.log(treeRoot);

    if (child.isDir) {
      console.log('selected a dir');
    }
  };

  return (
    <div className='flex flex-col h-full pt-4'>
      <Children node={treeRoot} onSelect={onSelect} />
    </div>
  );
}

const insertChild = (
  pathWhereToInsert: string,
  root: Node,
  newTreeRoot: Root
) => {
  for (const c of root.children) {
    if (!c.isDir) continue;

    if (pathWhereToInsert === c.path) {
      c.children.push(...newTreeRoot.children);
      return true;
    } else if (!isSubDir(root.path, pathWhereToInsert)) {
      continue;
    } else {
      const inserted = insertChild(pathWhereToInsert, c, newTreeRoot);
      if (inserted) {
        return true;
      }
    }
  }

  return false;
};

const isSubDir = (parent: string, dir: string) => {
  const relative = path.relative(parent, dir);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};
