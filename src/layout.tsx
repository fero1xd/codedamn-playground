import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import React from "react";
import { InfoAlert } from "./components/file-tree/info";

type LayoutProps = {
  [X in "fileTree" | "editor" | "terminal" | "preview"]:
    | React.ReactNode
    | (() => React.ReactNode);
} & {
  onLayout: () => void;
  pgId: string;
};

export function Layout({
  fileTree,
  editor,
  terminal,
  preview,
  onLayout,
  pgId,
}: LayoutProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full flex-1"
      onLayout={() => {
        onLayout();
      }}
    >
      <ResizablePanel defaultSize={15} maxSize={20} minSize={10}>
        <div className="relative h-[93vh] overflow-auto file__tree flex flex-col">
          {typeof fileTree === "function" ? fileTree() : fileTree}
          <div className="absolute bottom-2 right-2 cursor-pointer">
            <InfoAlert pgId={pgId} />
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={60}>
        <ResizablePanelGroup direction="vertical" onLayout={onLayout}>
          <ResizablePanel defaultSize={75}>
            {typeof editor === "function" ? editor() : editor}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={25}
            minSize={10}
            className="overflow-hidden"
          >
            {typeof terminal === "function" ? terminal() : terminal}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={25} maxSize={30} minSize={10}>
        {typeof preview === "function" ? preview() : preview}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
