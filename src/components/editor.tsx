import {
  Monaco,
  Editor as MonacoEditor,
  useMonaco,
} from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useMaterial } from './editor/use-material';
import { useEffect, useRef } from 'react';
import { Child } from '@/queries/types';
import { useQueryClient } from '@tanstack/react-query';
import { useConnection } from '@/hooks/use-connection';
import { configureHtml } from './editor/languages/html';
import { configureCss } from './editor/languages/css';
import { configureJson } from './editor/languages/json';
import { configureMd } from './editor/languages/md';
import { setupKeybindings } from './editor/keybindings';
import { configureTs } from './editor/languages/typescript';
import { configureJs } from './editor/languages/javascript';

const editorStates = new Map();

export function Editor({ selectedFile }: { selectedFile: Child | undefined }) {
  const { themeLoaded } = useMaterial();

  const monacoInstance = useMonaco() as Monaco | null;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const queryClient = useQueryClient();
  const conn = useConnection();

  useEffect(() => {
    if (!selectedFile || !conn || !editorRef.current || !monacoInstance) return;

    const currentModel = editorRef.current.getModel();

    if (
      currentModel &&
      currentModel.uri !== monaco.Uri.parse(`file:///${selectedFile.name}`)
    ) {
      console.log('setting view state');
      editorStates.set(
        currentModel.uri.toString(),
        editorRef.current.saveViewState()
      );
    }

    const existingModel = monacoInstance.editor.getModel(
      monaco.Uri.parse(`file:///${selectedFile.name}`)
    );

    if (existingModel) {
      // @ts-expect-error broken types
      editorRef.current.setModel(existingModel);

      const viewState = editorStates.get(existingModel.uri.toString());
      if (viewState) {
        console.log('restoring view state');
        editorRef.current.restoreViewState(viewState);

        editorRef.current.focus();
      }
    } else {
      queryClient
        .fetchQuery({
          queryKey: ['FETCH_CONTENT'],
          queryFn: () => {
            return conn.queries.FILE_CONTENT(selectedFile.path);
          },
          gcTime: 0,
        })
        .then((contents) => {
          console.log('adding model file:///', selectedFile.name);
          const createdModel = monacoInstance.editor.createModel(
            contents,
            undefined,
            monaco.Uri.parse(`file:///${selectedFile.name}`)
          );

          // @ts-expect-error Broken types
          editorRef.current?.setModel(createdModel);
        });
    }
  }, [conn, editorRef, monacoInstance, selectedFile, queryClient]);

  const onMount = async (e: monaco.editor.IStandaloneCodeEditor, m: Monaco) => {
    editorRef.current = e;

    // Language configurations start here
    configureHtml(e, m);
    configureCss(m);
    configureJson(m);
    configureMd(m);
    configureTs(e, m);
    configureJs(e, m);
    // Language configurations end here

    // NOTE: FOR JUMP TO DEF IN MULTI MODEL SETUP
    // const editorService = e._codeEditorService;
    // const openEditorBase = editorService.openCodeEditor.bind(editorService);
    // editorService.openCodeEditor = async (
    //   input: any,
    //   source: monaco.editor.ICodeEditor
    // ) => {
    //   const result = await openEditorBase(input, source);
    //   if (result === null) {
    //     console.log('intercepted');
    //     console.log('Open definition for:', input);
    //     console.log('Corresponding model:', m.editor.getModel(input.resource));

    //     source.setModel(m.editor.getModel(input.resource));
    //   }
    //   return result; // always return the base result
    // };

    setupKeybindings(e);

    // Start with a fresh slate
    m.editor.getModels().forEach((m) => m.dispose());
  };

  if (!themeLoaded) {
    return (
      <div className='h-full w-full flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  return (
    <MonacoEditor
      height='100%'
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
        mouseWheelZoom: true,
        automaticLayout: true,
        fontFamily: 'Cascadia Code',
      }}
      theme='uitheme'
      onMount={onMount}
    />
  );
}
