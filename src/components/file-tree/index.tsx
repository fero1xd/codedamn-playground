import { ChangeEvent, Root } from "@/queries/types";
import { useEffect } from "react";
import { Children } from "./children";
import { useQueryClient } from "@tanstack/react-query";
import { useWSQuery } from "@/hooks/use-ws-query";
import { Spinner } from "../ui/loading";
import { useConnection } from "@/hooks/use-connection";
import path from "path-browserify";
import { getAsciiDiff } from "@/lib/utils";

type FileTreeProps = {
  onReady: () => void;
};

export function FileTree({ onReady }: FileTreeProps) {
  const { data: treeRoot, isLoading } = useWSQuery(["GENERATE_TREE"]);
  const queryClient = useQueryClient();
  const { conn } = useConnection();

  useEffect(() => {
    console.log(treeRoot?.children);
    if (treeRoot) onReady();
    if (!conn) return;

    const removeListener = conn.addSubscription(
      "REFETCH_DIR",
      async (events: ChangeEvent) => {
        for (const data of events) {
          if (data.event === "change") return;

          const dirToRefetch =
            path.join(data.path, "..") === treeRoot?.path
              ? ""
              : path.join(data.path, "..");

          console.log("change event in file tree", { dirToRefetch });

          const queryKey =
            dirToRefetch === ""
              ? ["GENERATE_TREE"]
              : ["GENERATE_TREE", dirToRefetch];
          const queryData = await queryClient.getQueryData<Root>(queryKey);

          if (!queryData) return;

          if (data.event === "add" || data.event === "addDir") {
            await queryClient.setQueryData(queryKey, {
              ...queryData,
              children: [
                ...queryData.children,
                {
                  isDir: data.event === "addDir",
                  children: [],
                  name: path.basename(data.path),
                  path: data.path,
                  depth: 1,
                },
              ].sort((a, b) => {
                if (a.isDir && !b.isDir) {
                  return -1;
                } else if (!a.isDir && b.isDir) {
                  return 1;
                }

                return getAsciiDiff(a.name.toLowerCase(), b.name.toLowerCase());
              }),
            });
            return;
          }

          await queryClient.setQueryData(queryKey, {
            ...queryData,
            children: queryData.children.filter((ch) => ch.path !== data.path),
          });
        }
      }
    );

    return () => removeListener();
  }, [treeRoot, conn]);

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

  return <Children node={treeRoot} />;
}
