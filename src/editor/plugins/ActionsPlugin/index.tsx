import type { LexicalEditor } from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getRoot, $isParagraphNode, CLEAR_EDITOR_COMMAND } from "lexical";
import { useEffect, useState } from "react";

import useModal from "../../hooks/useModal";
import Button from "../../ui/Button";
import {
  SPEECH_TO_TEXT_COMMAND,
  SUPPORT_SPEECH_RECOGNITION,
} from "../SpeechToTextPlugin";
import DropDown, { DropDownItem } from "../../ui/DropDown";

async function sendEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  try {
    await fetch("http://localhost:1235/setEditorState", {
      body: stringifiedEditorState,
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      method: "POST",
    });
  } catch {
    // NO-OP
  }
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  let response = null;
  try {
    response = await fetch("http://localhost:1235/validateEditorState", {
      body: stringifiedEditorState,
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      method: "POST",
    });
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error(
      "Editor state validation failed! Server did not accept changes."
    );
  }
}

export interface AdditionalAction {
  icon?: string;
  label: string;
  onClick: (editor: LexicalEditor) => void;
}

interface IActionsPluginProps {
  additionalActions?: AdditionalAction[];
}

export default function ActionsPlugin({
  additionalActions,
}: IActionsPluginProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [modal, showModal] = useModal();

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      })
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, tags }) => {
      // If we are in read only mode, send the editor state
      // to server and ask for validation if possible.
      if (
        !isEditable &&
        dirtyElements.size > 0 &&
        !tags.has("historic") &&
        !tags.has("collaboration")
      ) {
        validateEditorState(editor);
      }
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        if (children.length > 1) {
          setIsEditorEmpty(false);
        } else {
          if ($isParagraphNode(children[0])) {
            const paragraphChildren = children[0].getChildren();
            setIsEditorEmpty(paragraphChildren.length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        }
      });
    });
  }, [editor, isEditable]);

  return (
    <div className="actions">
      {SUPPORT_SPEECH_RECOGNITION && (
        <button
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          disabled={!isEditable}
          className={
            "action-button action-button-mic " +
            (isSpeechToText ? "active" : "")
          }
          title="Speech To Text"
          aria-label={`${isSpeechToText ? "Enable" : "Disable"} speech to text`}
        >
          <i className="mic" />
        </button>
      )}
      <button
        className="action-button clear"
        disabled={isEditorEmpty || !isEditable}
        onClick={() => {
          showModal("Clear editor", (onClose) => (
            <ShowClearDialog editor={editor} onClose={onClose} />
          ));
        }}
        title="Clear"
        aria-label="Clear editor contents"
      >
        <i className="clear" />
      </button>
      <button
        className={`action-button ${!isEditable ? "unlock" : "lock"}`}
        onClick={() => {
          // Send latest editor state to commenting validation server
          if (isEditable) {
            sendEditorState(editor);
          }
          editor.setEditable(!editor.isEditable());
        }}
        title="Read-Only Mode"
        aria-label={`${!isEditable ? "Unlock" : "Lock"} read-only mode`}
      >
        <i className={!isEditable ? "unlock" : "lock"} />
      </button>
      {additionalActions && (
        <AdditionalActionsDropDown
          editor={editor}
          disabled={!isEditable}
          additionalActions={additionalActions}
        />
      )}

      {modal}
    </div>
  );
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
          }}
        >
          Clear
        </Button>{" "}
        <Button
          onClick={() => {
            editor.focus();
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}

function AdditionalActionsDropDown({
  editor,
  additionalActions,
  disabled = false,
}: {
  editor: LexicalEditor;
  additionalActions?: AdditionalAction[];
  disabled?: boolean;
}): JSX.Element {
  console.log("additionalActions", additionalActions);

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={"action-button"}
      buttonIconClassName={""}
      buttonAriaLabel={"More actions"}
    >
      {additionalActions?.map((action) => (
        <DropDownItem
          className={`item ${action.icon ? "icon" : ""}`}
          onClick={() => action.onClick(editor)}
          key={action.label}
        >
          {action.icon && <i className={`icon ${action.icon}`} />}
          <span className="text">{action.label}</span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}
