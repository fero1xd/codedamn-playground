import { Child } from "@/queries/types";
import { useMemo, useState } from "react";
import { Children } from "./children";
import { useQueryClient } from "@tanstack/react-query";
import { useWSQuery } from "@/hooks/use-ws-query";
import { Spinner } from "../ui/loading";
import { monaco } from "../editor/monaco";

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
  selectedFile?: string;
  setSelectedFile: (uri: string) => void;
}) {
  const [selectedDir, setSelectedDir] = useState<Child | undefined>(undefined);

  const { data: treeRoot, isLoading } = useWSQuery(
    ["GENERATE_TREE"],
    // A sub tree would be fresh for 2 minutes so react query will not refetch again and again on selection of same folders
    120 * 1000
  );

  const queryClient = useQueryClient();

  useMemo(() => {
    if (treeRoot) {
      // Later improve this by only giving changed portion of the tree and avoid recalculating depth for each element
      addDepth(treeRoot.children, 0);

      queryClient.setQueryData(["GENERATE_TREE"], treeRoot);
    }
  }, [treeRoot, queryClient]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!treeRoot) {
    return <p>error fetching workdir</p>;
  }

  const onSelect = (child: Child) => {
    if (child.isDir) {
      setSelectedDir(child);
      return;
    }

    const childUri = monaco.Uri.parse(
      `file:///${child.path.startsWith("/") ? child.path.slice(1) : child.path}`
    ).toString();

    console.log(childUri);

    if (!selectedFile || selectedFile !== childUri) {
      setSelectedFile(childUri);
    }
  };

  return (
    <div className="flex flex-col h-full min-w-full pt-4 overflow-scroll max-h-[99vh] file__tree">
      <Children
        selectedFile={selectedFile}
        node={treeRoot}
        onSelect={onSelect}
        selectedDir={selectedDir}
      />
    </div>
  );
}
