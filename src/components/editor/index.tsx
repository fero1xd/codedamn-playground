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
import { Editor as EditorType, TextModel } from "./types";
import { EditorState } from "./utils/editor-state";
import { Tabs } from "./tabs";
import { Spinner } from "../ui/loading";
import { safeName } from "./utils/imports";
import { useDebouncedCallback } from "use-debounce";
import { useToast } from "../ui/use-toast";
import { Bread } from "./bread";
import { useWSQuery } from "@/hooks/use-ws-query";
import { useQueryClient } from "@tanstack/react-query";
import path from "path-browserify";
import { Root } from "@/queries/types";
import { Placeholder } from "./placeholder";

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

  const { data: treeRoot } = useWSQuery(
    ["GENERATE_TREE"],
    // A sub tree would be fresh for 2 minutes so react query will not refetch again and again on selection of same folders
    120 * 1000
  );

  const conn = useConnection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const openFile = useCallback(
    async (editor: EditorType, m: Monaco, fileUri: string, silent = false) => {
      if (!conn) return;

      const currentModel = editor.getModel();

      if (currentModel && currentModel.uri.toString() !== fileUri) {
        console.log("setting view state");
        editorStates.set(currentModel, editor);
      }

      const existingModel = m.editor.getModel(monaco.Uri.parse(fileUri));

      if (existingModel) {
        console.log("existing model");

        if (silent) return;

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

        const uri = monaco.Uri.parse(fileUri);
        const createdModel = m.editor.createModel(contents, undefined, uri);

        console.log("created model", createdModel);
        if (silent) return;

        // @ts-expect-error Broken types
        editor.setModel(createdModel);

        setOpenedModels((prev) => [...prev, createdModel as TextModel]);
      }
    },
    [conn, openedModels]
  );

  useEffect(() => {
    if (!conn) return;

    const removeListener1 = conn.addSubscription(
      "FILE_SAVED",
      (msg: string) => {
        // toast({
        //   title: "File Saved",
        //   description: "Your changes are successfuly saved",
        // });
        console.log("server event file saved: " + msg);
      }
    );

    const removeListener2 = conn.addSubscription(
      "REFETCH_DIR",
      async (data: {
        event: "add" | "addDir" | "unlink" | "unlinkDir";
        path: string;
      }) => {
        console.log("changes in work dir: editor", data);
        const treeRoot = await queryClient.getQueryData<Root>([
          "GENERATE_TREE",
        ]);
        if (!treeRoot) return;

        if (data.event === "add") {
          if (!editorRef.current || !monacoInstance) return;

          openFile(
            editorRef.current,
            monacoInstance,
            monaco.Uri.parse(
              `file:///${data.path.startsWith("/") ? data.path.slice(1) : data.path}`
            ).toString(),
            true
          );
        } else if (data.event === "unlink") {
          if (!editorRef.current || !monacoInstance) return;

          const doesExists = monacoInstance.editor.getModel(
            monaco.Uri.parse(
              `file:///${data.path.startsWith("/") ? data.path.slice(1) : data.path}`
            )
          );

          if (doesExists) {
            console.log("unlinking/disposing model", data.path);

            setOpenedModels((prevModels) =>
              prevModels.filter(
                (p) => p.uri.toString() !== doesExists.uri.toString()
              )
            );

            if (selectedFile === doesExists.uri.toString()) {
              // Maybe switch models later here
              setSelectedFile(undefined);
            }

            doesExists.dispose();
          }
        }
      }
    );

    return () => {
      removeListener1();
      removeListener2();
    };
  }, [monacoInstance]);

  useEffect(() => {
    if (!conn) return;

    const removeSub = conn.addSubscription<Record<string, string>>(
      "INSTALL_DEPS",
      (data) => {
        console.log("NEW TYPE DEFS");

        console.log("monaco instance", !!monacoInstance);

        for (const dep of Object.keys(data)) {
          const pat = `file:///node_modules/${dep.startsWith("@types/") ? dep.replace("@types/", "") : safeName(dep)}/index.d.ts`;
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
  }, [monacoInstance]);

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

      if (event.oldModelUrl) {
        const oldModel = m.editor.getModel(event.oldModelUrl);
        if (!oldModel) return;

        const contents = oldModel.getValue();

        saveChanges.cancel();
        saveChangesRaw(oldModel.uri.path, contents);
      }

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
    // Language configurations end here
    setupKeybindings(e, () => {
      const currentModel = editorRef.current?.getModel();
      if (!currentModel) return;

      saveChanges.cancel();
      saveChangesRaw(currentModel.uri.path, currentModel.getValue());
    });

    // Start with a fresh slate
    m.editor.getModels().forEach((m) => m.dispose());

    const maps = await conn?.queries.GET_PROJECT_FILES();
    if (!maps) return;

    for (const filePath of Object.keys(maps)) {
      m.editor.createModel(
        maps[filePath] || "",
        undefined,
        monaco.Uri.parse(filePath.replace("/", ""))
      );
    }

    toast({
      description: "Loaded all project files",
    });

    configureTs(e, m);
    configureJs(e, m);
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

  const saveChangesRaw = async (filePath: string, contents: string) => {
    if (!conn || conn.ws?.readyState !== 1) return;

    console.log(filePath, contents);
    console.log(!!conn);

    conn.sendJsonMessage({
      nonce: "__ignored__",
      event: "SAVE_CHANGES",
      data: {
        filePath,
        newContent: contents,
      },
    });
  };

  const saveChanges = useDebouncedCallback(saveChangesRaw, 5000);

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
      {selectedFile && treeRoot && (
        <Bread selectedFile={selectedFile} rootPath={treeRoot.path} />
      )}
      {!selectedFile && <Placeholder />}
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
          fontFamily: "Cascadia Code, Sans Serif",
        }}
        theme="uitheme"
        onChange={(contents) => {
          if (!contents) return;

          // Or use "selectedFile" here
          const currentModel = editorRef.current?.getModel();
          if (!currentModel) return;

          saveChanges(currentModel.uri.path, contents);
        }}
        onMount={onMount}
      />
    </>
  );
}
