import { Editor } from "./types";
import * as monaco from "monaco-editor";

export function setupKeybindings(e: Editor, cb?: () => void) {
  e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
    console.log("formatting code");
    e.getAction("editor.action.formatDocument")?.run();
    cb?.();
  });
}
