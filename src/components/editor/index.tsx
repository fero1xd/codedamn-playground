import {
  Monaco,
  Editor as MonacoEditor,
  useMonaco,
} from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useMaterial } from "./use-material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection } from "@/hooks/use-connection";
import { configureHtml } from "./languages/html";
import { configureCss } from "./languages/css";
import { configureJson } from "./languages/json";
import { configureMd } from "./languages/md";
import { setupKeybindings } from "./keybindings";
import { configureTs } from "./languages/typescript";
import { configureJs } from "./languages/javascript";
import {
  Editor as EditorType,
  loadTypes,
  TextModel,
  typesService,
} from "./types";
import { EditorState } from "./utils/editor-state";
import { Tabs } from "./tabs";
import { Spinner } from "../ui/loading";
import { safeName } from "./utils/imports";
import { useDebouncedCallback } from "use-debounce";

const editorStates = new EditorState();

type EditorProps = {
  selectedFile: string | undefined;
  setSelectedFile: (f: string | undefined) => void;
};

export function Editor({ selectedFile, setSelectedFile }: EditorProps) {
  const { themeLoaded } = useMaterial();

  const monacoInstance = useMonaco() as Monaco | null;
  const [openedModels, setOpenedModels] = useState<TextModel[]>([]);
  const editorRef = useRef<EditorType>();

  const conn = useConnection();

  const openFile = useCallback(
    async (editor: EditorType, m: Monaco, fileUri: string) => {
      if (!conn) return;

      const currentModel = editor.getModel();

      if (currentModel && currentModel.uri.toString() !== fileUri) {
        console.log("setting view state");
        editorStates.set(currentModel, editor);
      }

      const existingModel = m.editor.getModel(monaco.Uri.parse(fileUri));

      if (existingModel) {
        console.log("existing model");
        // @ts-expect-error broken types
        editor.setModel(existingModel);

        if (
          openedModels.find(
            (opened) => opened.uri.toString() === existingModel.uri.toString()
          )
        ) {
          return;
        }

        console.log(openedModels);

        setOpenedModels((prev) => [...prev, existingModel as TextModel]);
      } else {
        console.log("creating model", fileUri);
        const contents = await conn.fetchCall<string>("FILE_CONTENT", {
          filePath: fileUri.replace("file://", ""),
        });

        const createdModel = m.editor.createModel(
          contents,
          undefined,
          monaco.Uri.parse(fileUri)
        );

        // @ts-expect-error Broken types
        editor.setModel(createdModel);

        setOpenedModels((prev) => [...prev, createdModel as TextModel]);
      }
    },
    [conn, openedModels]
  );

  useEffect(() => {
    if (!conn) return;

    console.log("yo from editor");

    const removeSub = conn.addSubscription<Record<string, string>>(
      "INSTALL_DEPS",
      (data) => {
        console.log("NEW TYPE DEFS");

        console.log("monaco instance", !!monacoInstance);

        for (const dep of Object.keys(data)) {
          const pat = `file:///node_modules/${dep === "@types/uuid" ? "uuid" : safeName(dep)}/index.d.ts`;
          console.log(dep, pat);

          monacoInstance?.languages.typescript.typescriptDefaults.addExtraLib(
            data[dep],
            pat
          );
        }
      }
    );

    return () => {
      removeSub();
    };
  }, [conn, monacoInstance]);

  useEffect(() => {
    if (!editorRef.current || !monacoInstance || !selectedFile) return;

    openFile(editorRef.current, monacoInstance, selectedFile);
  }, [selectedFile, editorRef, monacoInstance]);

  const onMount = async (e: EditorType, m: Monaco) => {
    editorRef.current = e;

    e.onDidChangeModel((event) => {
      setSelectedFile(
        event.newModelUrl ? event.newModelUrl.toString() : undefined
      );

      // Restore model view state if exists
      if (!event.newModelUrl) return;

      const newModel = m.editor.getModel(event.newModelUrl);
      if (newModel) {
        const editorState = editorStates.get(newModel as TextModel);
        if (editorState) {
          console.log("restoring view state");
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

  // const resolveDeps = useDebouncedCallback(async () => {
  //   const allDeps = ["uuid"];

  //   // const imports = getImports(e);

  //   // console.log('imports');
  //   // console.log(imports);

  //   const typesToGet = allDeps.reduce(
  //     (acc, lib) => {
  //       acc[lib] = "";

  //       return acc;
  //     },
  //     {} as Record<string, string>
  //   );

  //   const fetchedTypes = await typesService.getTypeUrls(
  //     Object.keys(typesToGet).filter((c) => typesToGet[c] === "")
  //   );

  //   const newLibs = await loadTypes(fetchedTypes);

  //   console.log("working defs");
  //   console.log(newLibs);

  //   // for (const lib of newLibs) {
  //   //   console.log(lib.filename);
  //   //   monacoInstance?.languages.typescript.typescriptDefaults.addExtraLib(
  //   //     lib.content,
  //   //     lib.filename
  //   //   );
  //   // }
  // }, 1000);

  if (!themeLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Tabs
        openedModels={openedModels}
        activeModelUri={selectedFile}
        onChangeModel={(m) => {
          if (!editorRef.current) return;

          const currentModel = editorRef.current.getModel();
          // Store model's view state before switching
          if (currentModel) {
            console.log("setting view state from tabs");
            editorStates.set(currentModel, editorRef.current);
          }

          editorRef.current?.setModel(m);
        }}
        closeModel={(m) => {
          if (!editorRef.current) return;

          console.log("setting view state before closing model");
          editorStates.set(m, editorRef.current);

          if (openedModels.length < 2) {
            setOpenedModels([]);
            editorRef.current.setModel(null);
            return;
          }

          const newTabs = openedModels.filter(
            (o) => o.uri.toString() !== m.uri.toString()
          );

          if (m.uri.toString() === selectedFile) {
            const randomTab =
              newTabs[Math.floor(Math.random() * newTabs.length)];

            editorRef.current.setModel(randomTab);
          }

          setOpenedModels(newTabs);
        }}
      />
      <MonacoEditor
        loading={<Spinner />}
        height="100%"
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
          fontFamily: "Cascadia Code",
        }}
        theme="uitheme"
        onMount={onMount}
      />
    </>
  );
}
