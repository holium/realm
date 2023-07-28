import { useState } from 'react';
import { baseKeymap } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { textCursorPlugin } from './plugins/text-cursor-plugin';
import { UserMetadata, yCaretPlugin } from './plugins/y-caret-plugin';
import { ySyncPlugin } from './plugins/y-sync-plugin';
import { yUndoPlugin } from './plugins/y-undo-plugin';
import { schema } from './schema';

export type OnYdocUpdate = (update: Uint8Array, origin: any) => void;

export type onAwarenessChange = (
  update: {
    added: number[];
    updated: number[];
    removed: number[];
  },
  origin: any
) => void;

type Props = {
  user: UserMetadata;
  ydoc: Y.Doc;
  awareness: Awareness;
  onYdocUpdate: OnYdocUpdate;
  onAwarenessChange: onAwarenessChange;
};

export const useEditorView = ({
  user,
  ydoc,
  awareness,
  onYdocUpdate,
  onAwarenessChange,
}: Props) => {
  const [editorView, setEditorView] = useState<EditorView>();

  const onEditorRef = (editorRef: HTMLDivElement) => {
    // Only initialize the editorView once.
    if (editorView) return;
    // Only initialize the editorView once the editorRef is available.
    if (!editorRef) return;

    const type = ydoc.getXmlFragment('prosemirror');

    const prosemirrorView = new EditorView(editorRef, {
      state: EditorState.create({
        schema,
        plugins: [
          history(),
          ySyncPlugin(type),
          yCaretPlugin(awareness, user),
          yUndoPlugin(),
          keymap(baseKeymap),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
          }),
          textCursorPlugin(),
        ],
      }),
    });

    // Set up listeners for updates to the ydoc and awareness.
    ydoc.on('update', onYdocUpdate);
    awareness.on('change', onAwarenessChange);

    setEditorView(prosemirrorView);
  };

  return { onEditorRef };
};
