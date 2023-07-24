import { useState } from 'react';
import { exampleSetup } from 'prosemirror-example-setup';
import { redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { useShipStore } from 'renderer/stores/ship.store';

import { ySyncPlugin } from './plugins/sync-plugin';
import { textCursorPlugin } from './plugins/text-cursor-plugin';
import { yUndoPlugin } from './plugins/undo-plugin';
import { schema } from './schema';

export const useCollabEditor = () => {
  const { notesStore } = useShipStore();

  const { selectedYDoc } = notesStore;

  const [editorView, setEditorView] = useState<EditorView>();

  const onEditorRef = (editorRef: HTMLDivElement) => {
    // Only initialize the editorView once.
    if (editorView) return;
    if (!selectedYDoc) return;

    const type = selectedYDoc.getXmlFragment('prosemirror');

    const prosemirrorView = new EditorView(editorRef, {
      state: EditorState.create({
        schema,
        plugins: [
          ySyncPlugin(type),
          // yCursorPlugin(provider.awareness),
          yUndoPlugin(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
          }),
          textCursorPlugin(),
        ].concat(exampleSetup({ schema })),
      }),
    });

    setEditorView(prosemirrorView);
  };

  const moveToEnd = () => {
    if (!editorView) return;

    console.log('Moving to end...');

    editorView.focus();
  };

  return { onEditorRef, moveToEnd };
};
