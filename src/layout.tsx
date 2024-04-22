import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import React from 'react';

type LayoutProps = {
  [X in 'fileTree' | 'editor' | 'terminal' | 'preview']:
    | React.ReactNode
    | (() => React.ReactNode);
} & {
  onLayout: () => void;
};

export function Layout({
  fileTree,
  editor,
  terminal,
  preview,
  onLayout,
}: LayoutProps) {
  return (
    <>
      <ResizablePanelGroup
        direction='horizontal'
        className='max-w-screen min-h-screen rounded-lg border'
        onLayout={() => {
          onLayout();
        }}
      >
        <ResizablePanel
          defaultSize={15}
          maxSize={20}
          minSize={10}
          className='overflow-hidden'
        >
          {/* <div className='flex h-full items-center justify-center p-6'> */}
          {/* <span className='font-semibold'>File tree</span> */}
          {typeof fileTree === 'function' ? fileTree() : fileTree}
          {/* </div> */}
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction='vertical' onLayout={onLayout}>
            <ResizablePanel defaultSize={75}>
              {/* <div className='flex h-full items-center justify-center p-6'>
                <span className='font-semibold'>Code</span>
              </div> */}
              {typeof editor === 'function' ? editor() : editor}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25} minSize={10}>
              {/* <div className='flex h-full -center justify-center p-6'>
                <span className='font-semibold'>terminal</span>
              </div> */}
              {typeof terminal === 'function' ? terminal() : terminal}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={20} maxSize={30} minSize={10}>
          {/* <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>preview</span>
          </div> */}
          {typeof preview === 'function' ? preview() : preview}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
