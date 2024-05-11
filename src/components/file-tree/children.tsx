import { Child, Node } from "@/queries/types";
import { getIcon } from "./icons";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useWSQuery } from "@/hooks/use-ws-query";
import { monaco } from "../editor/monaco";
import { useSelectedItem } from "@/stores/selected-item";

type ChildrenProps = {
  node: Node;
};

export function Children({ node }: ChildrenProps) {
  return node.children.map((c) => (
    <Item key={c.path + "/" + c.name} node={c} />
  ));
}

type ItemProps = ChildrenProps & {
  node: Child;
};

function Item({ node }: ItemProps) {
  const [open, setOpen] = useState(false);
  const path = node.path;
  const uri = monaco.Uri.parse(
    `file:///${path.startsWith("/") ? path.slice(1) : path}`
  ).toString();

  const { selectedDir, selectedFile, setSelectedDir, setSelectedFile } =
    useSelectedItem();

  const isSelected = selectedFile ? selectedFile === uri : selectedDir === path;
  return (
    <>
      <div
        key={node.path}
        onClick={() => {
          if (node.isDir) {
            setOpen((o) => !o);
            setSelectedDir(path);
          } else {
            setSelectedFile(uri);
          }
        }}
        className={cn(
          `flex items-center transition-all ease-out`,
          `${isSelected ? "bg-gray-900" : "bg-transparent"} hover:cursor-pointer hover:bg-gray-900`
        )}
        style={{ paddingLeft: `${(node.depth || 1) * 16}px` }}
      >
        <span className="flex w-[32px] h-[32px] items-center justify-center">
          {getIcon(node.name.split(".").pop() || "", node.name, {
            isDir: node.isDir,
            open,
          })}
        </span>

        <span style={{ marginLeft: 1, marginBottom: 3 }}>{node.name}</span>
      </div>

      {open && node.isDir && <Nested node={node} />}
    </>
  );
}

function Nested({ node: dir }: ItemProps) {
  const { data, isLoading } = useWSQuery(["GENERATE_TREE", dir.path]);

  const useFullData = useMemo(() => {
    if (data) {
      const cloned = { ...data };

      cloned.children.forEach((c) => {
        c.depth = (dir.depth !== undefined ? dir.depth : 1) + 1;
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

  return <Children key={dir.path + dir.name} node={useFullData} />;
}
