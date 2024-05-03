import { ChangeEvent, Child } from "@/queries/types";
import { useEffect, useMemo } from "react";
import { Children } from "./children";
import { useQueryClient } from "@tanstack/react-query";
import { useWSQuery } from "@/hooks/use-ws-query";
import { Spinner } from "../ui/loading";
import { useConnection } from "@/hooks/use-connection";
import path from "path-browserify";

const addDepth = (children: Child[], currentDepth: number) => {
  children.forEach((i) => {
    i.depth = currentDepth + 1;

    if (i.isDir) {
      addDepth(i.children, currentDepth + 1);
    }
  });
};

export function FileTree({ onReady }: { onReady: () => void }) {
  const { data: treeRoot, isLoading } = useWSQuery(["GENERATE_TREE"]);
  // const { selectedFile, setSelectedFile, setSelectedDir, selectedDir } =
  //   useSelectedItem();

  const queryClient = useQueryClient();
  const conn = useConnection();

  useEffect(() => {
    if (treeRoot) onReady();

    if (!conn) return;

    const removeListener = conn.addSubscription(
      "REFETCH_DIR",
      (data: ChangeEvent) => {
        const finalPath =
          path.join(data.path, "..") === treeRoot?.path
            ? ""
            : path.join(data.path, "..");

        console.log("change event in file tree", { finalPath });

        if (data.event === "unlinkDir" && finalPath === data.path) {
        }

        if (finalPath === "") {
          queryClient.invalidateQueries({
            predicate(query) {
              return (
                query.queryKey[0] === "GENERATE_TREE" &&
                query.queryKey.length === 1
              );
            },
            refetchType: "all",
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: ["GENERATE_TREE", finalPath],
            refetchType: "all",
          });
        }
      }
    );

    return () => removeListener();
  }, [treeRoot, conn]);

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

  // const onSelect = (child: Child) => {
  //   if (child.isDir) {
  //     setSelectedDir(child.path);
  //     return;
  //   }

  //   const childUri = monaco.Uri.parse(
  //     `file:///${child.path.startsWith("/") ? child.path.slice(1) : child.path}`
  //   ).toString();

  //   if (!selectedFile || selectedFile !== childUri) {
  //     setSelectedFile(childUri);
  //   }
  // };

  return <Children node={treeRoot} />;
}
