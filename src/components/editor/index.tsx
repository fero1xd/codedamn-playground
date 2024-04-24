import {
  Monaco,
  Editor as MonacoEditor,
  useMonaco,
} from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useMaterial } from './use-material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Child, Dependencies } from '@/queries/types';
import { useConnection } from '@/hooks/use-connection';
import { configureHtml } from './languages/html';
import { configureCss } from './languages/css';
import { configureJson } from './languages/json';
import { configureMd } from './languages/md';
import { setupKeybindings } from './keybindings';
import { configureTs } from './languages/typescript';
import { configureJs } from './languages/javascript';
import {
  Editor as EditorType,
  loadTypes,
  TextModel,
  typesService,
} from './types';
import { EditorState } from './utils/editor-state';
import { useDebouncedCallback } from 'use-debounce';
import { Tabs } from './tabs';

const editorStates = new EditorState();

type EditorProps = {
  selectedFile: Child | undefined;
};

export function Editor({ selectedFile }: EditorProps) {
  const { themeLoaded } = useMaterial();

  const monacoInstance = useMonaco() as Monaco | null;
  const [openedModels, setOpenedModels] = useState<TextModel[]>([]);
  const [activeModelUri, setActiveModelUri] = useState<monaco.Uri>();
  const editorRef = useRef<EditorType>();

  const conn = useConnection();

  const openFile = useCallback(
    async (editor: EditorType, m: Monaco, file: Child) => {
      if (!file || !conn) return;

      const currentModel = editor.getModel();

      if (
        currentModel &&
        currentModel.uri !== monaco.Uri.parse(`file:///${file.name}`)
      ) {
        console.log('setting view state');
        editorStates.set(currentModel, editor);
      }

      const existingModel = m.editor.getModel(
        monaco.Uri.parse(`file:///${file.name}`)
      );

      if (existingModel) {
        console.log('existing model');
        // @ts-expect-error broken types
        editor.setModel(existingModel);

        if (openedModels.find((opened) => opened.uri === existingModel.uri)) {
          return;
        }

        setOpenedModels((prev) => [...prev, existingModel as TextModel]);
      } else {
        console.log('creating model');
        const contents = await conn.fetchCall<string>('FILE_CONTENT', {
          filePath: file.path,
        });

        const createdModel = m.editor.createModel(
          contents,
          undefined,
          monaco.Uri.parse(`file:///${file.name}`)
        );

        // @ts-expect-error Broken types
        editor.setModel(createdModel);

        setOpenedModels((prev) => [...prev, createdModel as TextModel]);
      }
    },
    [conn]
  );

  useEffect(() => {
    if (!conn) return;

    const removeSub = conn.addSubscription<Dependencies>(
      'INSTALL_DEPS',
      (data) => {
        console.log('CHANGE IN DEPS');
        console.log(data);
      }
    );

    return () => {
      removeSub();
    };
  }, [conn]);

  useEffect(() => {
    if (!editorRef.current || !monacoInstance || !selectedFile) return;

    openFile(editorRef.current, monacoInstance, selectedFile);
  }, [selectedFile, editorRef, monacoInstance]);

  const onMount = async (e: EditorType, m: Monaco) => {
    editorRef.current = e;

    e.onDidChangeModel((event) => {
      setActiveModelUri((event.newModelUrl as monaco.Uri) || undefined);
      // Restore model view state if exists
      if (!event.newModelUrl) return;

      const newModel = m.editor.getModel(event.newModelUrl);
      if (newModel) {
        const editorState = editorStates.get(newModel as TextModel);
        if (editorState) {
          console.log('restoring view state');
          e.restoreViewState(editorState);
          e.focus();
        }
      }
    });

    // Language configurations start here
    configureHtml(e, m);
    configureCss(m);
    configureJson(m);
    configureMd(m);
    configureTs(e, m);
    configureJs(e, m);
    // Language configurations end here
    setupKeybindings(e);

    // Start with a fresh slate
    m.editor.getModels().forEach((m) => m.dispose());
  };

  useEffect(() => {
    console.log('active model uri change ', activeModelUri?.toString());
  }, [activeModelUri]);

  const resolveDeps = useDebouncedCallback(async (deps: Dependencies) => {
    const allDeps = [
      ...Object.keys(deps.dependencies),
      ...Object.keys(deps.devDependencies),
    ];

    // const imports = getImports(e);

    // console.log('imports');
    // console.log(imports);

    const typesToGet = allDeps.reduce(
      (acc, lib) => {
        acc[lib] = '';

        return acc;
      },
      {} as Record<string, string>
    );

    const fetchedTypes = await typesService.getTypeUrls(
      Object.keys(typesToGet).filter((c) => typesToGet[c] === '')
    );

    const newLibs = await loadTypes(fetchedTypes);

    for (const lib of newLibs) {
      console.log(lib.filename);
      monacoInstance?.languages.typescript.typescriptDefaults.addExtraLib(
        lib.content,
        lib.filename
      );
    }
  }, 1000);

  if (!themeLoaded) {
    return (
      <div className='h-full w-full flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Tabs
        openedModels={openedModels}
        activeModelUri={activeModelUri}
        onChangeModel={(m) => {
          if (!editorRef.current) return;

          const currentModel = editorRef.current.getModel();
          // Store model's view state before switching
          if (currentModel) {
            console.log('setting view state from tabs');
            editorStates.set(currentModel, editorRef.current);
          }

          editorRef.current?.setModel(m);
        }}
        closeModel={(m, index) => {
          if (!editorRef.current) return;

          console.log('setting view state before closing model');
          editorStates.set(m, editorRef.current);

          if (openedModels.length < 2) {
            setOpenedModels([]);
            editorRef.current.setModel(null);
            return;
          }
        }}
      />
      <MonacoEditor
        height='100%'
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          mouseWheelZoom: true,
          automaticLayout: true,
          padding: {
            top: 10,
          },
        }}
        theme='uitheme'
        onMount={onMount}
      />
    </>
  );
}
