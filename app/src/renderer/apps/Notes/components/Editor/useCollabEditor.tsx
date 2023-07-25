import { useState } from 'react';
import { baseKeymap } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as Y from 'yjs';

import { ySyncPlugin } from './plugins/sync-plugin';
import { textCursorPlugin } from './plugins/text-cursor-plugin';
import { yUndoPlugin } from './plugins/undo-plugin';
import { schema } from './schema';

type Props = {
  ydoc: Y.Doc | null;
};

export const useCollabEditor = ({ ydoc }: Props) => {
  const [editorView, setEditorView] = useState<EditorView>();

  const onEditorRef = (editorRef: HTMLDivElement) => {
    // Only initialize the editorView if the ydoc is ready.
    if (!ydoc) return;
    // Only initialize the editorView once.
    if (editorView) return;

    const type = ydoc.getXmlFragment('prosemirror');

    const prosemirrorView = new EditorView(editorRef, {
      state: EditorState.create({
        schema,
        plugins: [
          history(),
          ySyncPlugin(type),
          // yCursorPlugin(provider.awareness),
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

    setEditorView(prosemirrorView);
  };

  return { onEditorRef };
};
