import { Child } from '@/queries/types';
import { useMemo, useState } from 'react';
import { Children } from './children';
import { useQueryClient } from '@tanstack/react-query';
import { useWSQuery } from '@/hooks/use-ws-query';

const addDepth = (children: Child[], currentDepth: number) => {
  children.forEach((i) => {
    i.depth = currentDepth + 1;

    if (i.isDir) {
      addDepth(i.children, currentDepth + 1);
    }
  });
};

export function FileTree({
  selectedFile,
  setSelectedFile,
}: {
  selectedFile?: Child;
  setSelectedFile: (file: Child) => void;
}) {
  const [selectedDir, setSelectedDir] = useState<Child | undefined>(undefined);

  const { data: treeRoot, isLoading } = useWSQuery(
    ['GENERATE_TREE'],
    // A sub tree would be fresh for 2 minutes so react query will not refetch again and again on selection of same folders
    120 * 1000
  );

  const queryClient = useQueryClient();

  useMemo(() => {
    if (treeRoot) {
      // Later improve this by only giving changed portion of the tree and avoid recalculating depth for each element
      addDepth(treeRoot.children, 0);

      queryClient.setQueryData(['GENERATE_TREE'], treeRoot);
    }
  }, [treeRoot, queryClient]);

  if (isLoading) {
    return null;
  }

  if (!treeRoot) {
    return <p>error fetching workdir</p>;
  }

  const onSelect = (child: Child) => {
    console.log(child.path);

    if (child.isDir) {
      setSelectedDir(child);
      return;
    }

    if (!selectedFile || selectedFile.path !== child.path) {
      setSelectedFile(child);
    }
  };

  return (
    <div className='flex flex-col h-full pt-4 overflow-scroll max-h-[99vh] file__tree'>
      <Children
        selectedFile={selectedFile}
        node={treeRoot}
        onSelect={onSelect}
        selectedDir={selectedDir}
      />
    </div>
  );
}

// const insertChild = (
//   pathWhereToInsert: string,
//   root: Node,
//   newTreeRoot: Root
// ) => {
//   for (const c of root.children) {
//     if (!c.isDir) continue;

//     if (pathWhereToInsert === c.path) {
//       c.children.push(...newTreeRoot.children);
//       return true;
//     } else if (!isSubDir(root.path, pathWhereToInsert)) {
//       continue;
//     } else {
//       const inserted = insertChild(pathWhereToInsert, c, newTreeRoot);
//       if (inserted) {
//         return true;
//       }
//     }
//   }

//   return false;
// };

// const isSubDir = (parent: string, dir: string) => {
//   const relative = path.relative(parent, dir);
//   return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
// };
