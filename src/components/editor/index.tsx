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
import { useDebouncedCallback } from "use-debounce";
import { useToast } from "../ui/use-toast";
import { Bread } from "./bread";
import { useWSQuery } from "@/hooks/use-ws-query";
import { useQueryClient } from "@tanstack/react-query";
import { Dependencies, Root } from "@/queries/types";
import { Placeholder } from "./placeholder";

const editorStates = new EditorState();

type EditorProps = {
  selectedFile: string | undefined;
  setSelectedFile: (f: string | undefined) => void;
  onReady: () => void;
};

export function Editor({
  selectedFile,
  setSelectedFile,
  onReady,
}: EditorProps) {
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
        editorStates.set(currentModel, editor);
      }

      const existingModel = m.editor.getModel(monaco.Uri.parse(fileUri));

      if (existingModel) {
        if (existingModel.uri.toString() === currentModel?.uri.toString())
          return;

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

    const listeners: (() => void)[] = [];

    listeners.push(
      conn.addSubscription("FILE_SAVED", (msg: string) => {
        // toast({
        //   title: "File Saved",
        //   description: "Your changes are successfuly saved",
        // });
        console.log("server event file saved: " + msg);
      })
    );

    listeners.push(
      conn.addSubscription(
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

              doesExists.dispose();
            }
          }
        }
      )
    );

    listeners.push(
      conn.addSubscription<Dependencies>("INSTALL_DEPS", (deps) => {
        console.log("NEW TYPE DEFS");
        resolveDeps(deps);
      })
    );

    return () => {
      listeners.forEach((l) => l());
    };
  }, [monacoInstance]);

  useEffect(() => {
    if (!editorRef.current || !monacoInstance || !selectedFile) return;

    openFile(editorRef.current, monacoInstance, selectedFile);
  }, [selectedFile, editorRef, monacoInstance]);

  const onMount = useCallback(
    async (e: EditorType, m: Monaco) => {
      editorRef.current = e;

      e.onDidChangeModel((event) => {
        setSelectedFile(
          event.newModelUrl ? event.newModelUrl.toString() : undefined
        );

        if (event.oldModelUrl) {
          const oldModel = m.editor.getModel(event.oldModelUrl);
          if (!oldModel || oldModel.isDisposed()) return;

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

      // @ts-expect-error tttt
      const { default: highlighter } = await import("monaco-jsx-highlighter");
      console.log(highlighter);

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

      console.log("requesting project files");
      console.log(conn?.isReady);

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

      onReady();
    },
    [conn, conn?.isReady]
  );

  const resolveDeps = useDebouncedCallback(async (deps: Dependencies) => {
    const fetchedTypes = await typesService.getTypeUrls(deps);

    const newLibs = await loadTypes(fetchedTypes);

    console.log("got type urls");
    console.log(newLibs);

    for (const lib of newLibs) {
      monacoInstance?.languages.typescript.typescriptDefaults.addExtraLib(
        lib.content,
        lib.filename
      );
    }
  }, 1000);

  const saveChangesRaw = async (filePath: string, contents: string) => {
    if (!conn || !conn.isReady) return;

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
          fontLigatures: true,
        }}
        className="__editor__"
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
