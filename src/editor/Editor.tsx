import Plugins from "./Plugins";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import PlaygroundNodes from "./nodes/PlaygroundNodes";

import "./styles.css";

export interface IEditorProps {
  onSave?: (json: string) => void;
  debug?: boolean;
  mode?: "edit" | "view";
  content?: string;
}

export default function Editor({
  onSave,
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
              <Plugins onSave={onSave} debug={debug} />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
