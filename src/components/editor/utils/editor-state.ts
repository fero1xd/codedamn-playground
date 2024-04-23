import { Editor, TextModel, ViewState } from '../types';

export class EditorState {
  private _editorState: Map<string, ViewState>;

  constructor() {
    this._editorState = new Map();
  }

  set(model: TextModel, editor: Editor) {
    this._editorState.set(model.uri.toString(), editor.saveViewState()!);
  }

  get(model: TextModel) {
    return this._editorState.get(model.uri.toString());
  }
}
