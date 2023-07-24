import { useState } from 'react';
import { exampleSetup } from 'prosemirror-example-setup';
import { redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import {
  EditorState,
  Plugin,
  TextSelection,
  Transaction,
} from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { useShipStore } from 'renderer/stores/ship.store';

import { ySyncPlugin, yUndoPlugin } from './plugins/y-prosemirror';
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

    console.log('firstline preview', type.toDOM().firstChild?.textContent);

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
          new Plugin({
            props: {
              decorations(state) {
                const decorations: Decoration[] = [];
                const { doc, selection } = state;
                const { from, to } = selection;
                doc.descendants((node, pos) => {
                  if (node.type.name === 'paragraph') {
                    const isCurrent = from >= pos && to <= pos + node.nodeSize;
                    const className = isCurrent
                      ? 'text-cursor current-element'
                      : 'text-cursor';
                    decorations.push(
                      Decoration.node(pos, pos + node.nodeSize, {
                        class: className,
                      })
                    );
                  }
                });
                return DecorationSet.create(doc, decorations);
              },
            },
          }),
        ].concat(exampleSetup({ schema })),
      }),
    });

    setEditorView(prosemirrorView);
  };

  const moveToEnd = () => {
    if (!editorView) return;

    console.log('Moving to end...');
    // Focus the editor.
    editorView.focus();

    // Move the cursor to the end of the doc and line.
    const transaction: Transaction = editorView.state.tr.setSelection(
      new TextSelection(
        editorView.state.doc.resolve(editorView.state.doc.nodeSize - 2)
      )
    );
    editorView.dispatch(transaction);
  };

  return { onEditorRef, moveToEnd };
};
