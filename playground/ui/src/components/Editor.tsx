import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";
import { useChannel } from "../lib/realm-multiplayer";
import { BaseRealmPayload } from "../../../../app/src/renderer/system/desktop/components/Multiplayer/types";
import debounce from "lodash.debounce";
const ydoc = new Y.Doc();

interface Props {
  id: string;
}

interface EditorChangesPayload extends BaseRealmPayload {
  event: "update-text";
  target: string;
  changes: Uint8Array;
}

function Editor({ id }: Props) {
  const send = useChannel<EditorChangesPayload>("update-text", (payload) => {
    if (payload.target !== id) return;
    const updates = new Uint8Array(Object.values(payload.changes));
    console.log("received updates", updates);
    Y.applyUpdate(ydoc, updates);
  });

  const debouncedSend = useCallback(
    debounce(
      () => {
        send({
          event: "update-text",
          target: id,
          changes: Y.encodeStateAsUpdate(ydoc),
        });
      },
      100,
      { leading: true, trailing: true }
    ),
    [send]
  );

  const editor = useEditor(
    {
      editorProps: {
        attributes: {
          style: "border: 1px solid black",
        },
      },
      extensions: [
        StarterKit.configure({
          // The Collaboration extension comes with its own history handling
          history: false,
        }),
        // Register the document with Tiptap
        Collaboration.configure({
          document: ydoc,
        }),
      ],
      content: "<p>This is a text editor!</p>",
      onUpdate: () => {
        // FIXME: fake delay
        setTimeout(() => {
          debouncedSend();
        }, 1000);
      },
    },
    [debouncedSend]
  );

  return <EditorContent editor={editor} />;
}

export { Editor };
