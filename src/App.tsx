import Editor from "./editor";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SharedAutocompleteContext } from "./editor/context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./editor/context/SharedHistoryContext";
import { TableContext } from "./editor/plugins/TablePlugin";
import PlaygroundEditorTheme from "./editor/themes/PlaygroundEditorTheme";
import PlaygroundNodes from "./editor/nodes/PlaygroundNodes";

function App() {
  return (
    <LexicalComposer
      initialConfig={{
        editable: true,
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
              <Editor />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}

export default App;
