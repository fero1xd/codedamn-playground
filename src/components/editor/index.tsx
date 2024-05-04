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
import { useSelectedItem } from "@/stores/selected-item";

type EditorProps = {
  onReady: () => void;
};

export function Editor({ onReady }: EditorProps) {
  const { themeLoaded } = useMaterial();
  const editorStates = useRef(new EditorState());

  const monacoInstance = useMonaco() as Monaco | null;
  const [openedModels, setOpenedModels] = useState<TextModel[]>([]);
  const editorRef = useRef<EditorType>();
  const [hasMounted, setMounted] = useState(false);
  const { selectedFile, setSelectedFile } = useSelectedItem();

  const { data: treeRoot } = useWSQuery(["GENERATE_TREE"]);

  const conn = useConnection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const openFile = useCallback(
    async (
      editor: EditorType,
      m: Monaco,
      fileUri: string,
      silent = false,
      addAsLib = false
    ) => {
      if (!conn) return;

      const currentModel = editor.getModel();
      if (currentModel) {
        console.log("Storing view state");
        editorStates.current.set(currentModel, editor);
      }

      const existingModel = m.editor.getModel(monaco.Uri.parse(fileUri));

      const contents = await conn.fetchCall<string>("FILE_CONTENT", {
        filePath: fileUri.replace("file://", ""),
      });
      existingModel?.setValue(contents);

      if (addAsLib) {
        const allLibs =
          m.languages.typescript.typescriptDefaults.getExtraLibs();

        for (const libPath of Object.keys(allLibs)) {
          if (libPath === fileUri) {
            console.log("**found match**");
            allLibs[libPath] = {
              version: allLibs[libPath].version,
              content: contents,
            };
            break;
          }
        }

        console.log(allLibs, fileUri);

        m.languages.typescript.typescriptDefaults.setExtraLibs(
          Object.entries(allLibs).map((e) => ({
            content: e[1].content,
            filePath: e[0],
          }))
        );
      }

      if (existingModel) {
        if (
          existingModel.uri.toString() === currentModel?.uri.toString() ||
          silent
        )
          return;

        // @ts-expect-error broken types
        editor.setModel(existingModel);

        if (
          openedModels.find(
            (opened) => opened.uri.toString() === existingModel.uri.toString()
          )
        ) {
          return;
        }

        setOpenedModels((prev) => [...prev, existingModel as TextModel]);
      } else {
        console.log("creating model", fileUri);
        const uri = monaco.Uri.parse(fileUri);

        if (addAsLib) {
          console.log("adding as extra lib", uri.toString());
          m.languages.typescript.typescriptDefaults.addExtraLib(
            contents,
            uri.toString()
          );
        }
        const createdModel = m.editor.createModel(contents, undefined, uri);

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
          event: "add" | "addDir" | "unlink" | "unlinkDir" | "change";
          path: string;
        }) => {
          console.log("changes in work dir: editor", data);
          const treeRoot = await queryClient.getQueryData<Root>([
            "GENERATE_TREE",
          ]);
          if (!treeRoot) return;

          const uri = monaco.Uri.parse(
            `file:///${data.path.startsWith("/") ? data.path.slice(1) : data.path}`
          );

          if (data.event === "add") {
            if (!editorRef.current || !monacoInstance) return;

            openFile(
              editorRef.current,
              monacoInstance,
              uri.toString(),
              true,
              true
            );
          } else if (data.event === "unlink") {
            if (!editorRef.current || !monacoInstance) return;

            const doesExists = monacoInstance.editor.getModel(uri);

            if (doesExists) {
              console.log("unlinking/disposing model", data.path);

              setOpenedModels((prevModels) =>
                prevModels.filter(
                  (p) => p.uri.toString() !== doesExists.uri.toString()
                )
              );

              doesExists.dispose();
            }
          } else if (data.event === "change") {
            if (!editorRef.current || !monacoInstance) return;

            const currentModel = await editorRef.current?.getModel();
            if (!currentModel) return;

            if (currentModel.uri.toString() === uri.toString()) {
              const newContents = await conn.fetchCall("FILE_CONTENT", {
                filePath: data.path,
              });

              if (newContents !== currentModel.getValue()) {
                toast({
                  title: "Alert",
                  description:
                    "Their are changes in the current file, saving the file would overwrite them!",
                });
              }
            } else {
              openFile(
                editorRef.current,
                monacoInstance,
                uri.toString(),
                true,
                true
              );
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

  const goToDefPos = useRef<{ lineNumber: number; column: number }>();

  const onMount = async (e: EditorType, m: Monaco) => {
    editorRef.current = e;

    e.onDidChangeModel((event) => {
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
        const editorState = editorStates.current.get(newModel as TextModel);
        if (editorState) {
          console.log("restoring view state");
          e.restoreViewState(editorState);
        }

        if (goToDefPos.current) {
          console.log("setting cur position coz of go to def");
          e.setPosition({
            column: goToDefPos.current.column,
            lineNumber: goToDefPos.current.lineNumber,
          });

          goToDefPos.current = undefined;
        }

        e.focus();
      }
    });

    // For jump to defs
    // @ts-expect-error Internal
    const editorService = e._codeEditorService;
    const openEditorBase = editorService.openCodeEditor.bind(editorService);
    editorService.openCodeEditor = async (
      input: any,
      source: monaco.editor.ICodeEditor
    ) => {
      const result = await openEditorBase(input, source);
      if (result === null) {
        console.log("intercepted");
        console.log("Open definition for:", input);
        // console.log("Corresponding model:", m.editor.getModel(input.resource));
        goToDefPos.current = {
          lineNumber: input.options.selection.startLineNumber,
          column: input.options.selection.startColumn,
        };
        setSelectedFile(input.resource.toString());

        // source.setModel(m.editor.getModel(input.resource));
      }
      return result; // always return the base result
    };

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

    setMounted(true);

    // Start with a fresh slate
    m.editor.getModels().forEach((m) => m.dispose());
  };

  const hasRequested = useRef(false);

  useEffect(() => {
    if (!hasMounted) return;
    if (
      !conn?.isReady ||
      !monacoInstance ||
      !editorRef.current ||
      hasRequested.current
    )
      return;

    hasRequested.current = true;

    console.log("requesting project files");

    conn?.queries.GET_PROJECT_FILES().then(async (files) => {
      await Promise.all(
        files.map((f) =>
          openFile(
            editorRef.current!,
            monacoInstance,

            monaco.Uri.parse(f.replace("/", "")).toString(),
            true,
            true
          )
        )
      );

      toast({
        description: "Loaded all project files",
      });

      configureTs(monacoInstance);
      configureJs(monacoInstance);

      onReady();
    });
  }, [conn, conn?.isReady, monacoInstance, hasMounted]);

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
    console.log("SENDING SAVE CHANGES", filePath);

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

          setSelectedFile(m.uri.toString());
        }}
        closeModel={(m) => {
          if (!editorRef.current) return;

          if (openedModels.length < 2) {
            setOpenedModels([]);

            console.log("setting view state from tabs");
            editorStates.current.set(m, editorRef.current);
            editorRef.current.setModel(null);

            setSelectedFile(undefined);
            return;
          }

          const newTabs = openedModels.filter(
            (o) => o.uri.toString() !== m.uri.toString()
          );

          if (m.uri.toString() === selectedFile) {
            const randomTab =
              newTabs[Math.floor(Math.random() * newTabs.length)];

            // editorRef.current.setModel(randomTab);
            setSelectedFile(randomTab.uri.toString());
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
