import Plugins from "./Plugins";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import PlaygroundNodes from "./nodes/PlaygroundNodes";

import "./styles.css";
import { AdditionalAction } from "./plugins/ActionsPlugin";
import { EditorState } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

export interface IEditorProps {
  actions?: AdditionalAction[];
  onChange?: (json: string, editorState: EditorState) => void;
  debug?: boolean;
  mode?: "edit" | "view";
  content?: string;
}

export default function Editor({
  actions,
  onChange,
  mode = "edit",
  content,
  debug = false,
}: IEditorProps): JSX.Element {
  return (
    <LexicalComposer
      initialConfig={{
        editable: mode === "edit",
        editorState(editor) {
          if (content) {
            editor.setEditorState(editor.parseEditorState(content));
          }
        },
        namespace: "Editor",
        nodes: [...PlaygroundNodes],
        onError: (error: Error) => {
          throw error;
        },
        theme: PlaygroundEditorTheme,
      }}
    >
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell">
              <Plugins actions={actions} debug={debug} />
              <OnChangePlugin
                onChange={(editorState) => {
                  const json = editorState.toJSON();
                  onChange?.(JSON.stringify(json), editorState);
                }}
              />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
