import {
  collab,
  getVersion,
  receiveTransaction,
  sendableSteps,
} from 'prosemirror-collab';
import { baseKeymap } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { JSONObject } from 'os/types';

import { Authority } from './Authority';
import { streamCaretPlugin } from './Caret';
import { SendCaret, SendTransaction } from './Editor';
import { SelectionSizeTooltip } from './plugins/SelectionSizeTooltip';

export const collabEditor = (
  authority: Authority,
  place: HTMLElement,
  sendTransaction: SendTransaction,
  sendCaret: SendCaret,
  saveDoc: (serializedDoc: JSONObject) => void
) => {
  const view = new EditorView(place, {
    state: EditorState.create({
      doc: authority.doc ?? undefined,
      plugins: [
        history(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
        }),
        keymap(baseKeymap),
        collab({ version: authority.steps.length }),
        streamCaretPlugin((x, y) => sendCaret(window.ship, x, y)),
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
        new Plugin({
          view(editorView) {
            return new SelectionSizeTooltip(editorView);
          },
        }),
      ],
    }),
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction);
      view.updateState(newState);

      const serializedDoc = newState.doc.toJSON();
      saveDoc(serializedDoc);

      const sendable = sendableSteps(newState);
      if (sendable) {
        authority.receiveSteps(
          sendable.version,
          sendable.steps,
          sendable.clientID
        );

        const serializedSteps = sendable.steps.map((s) => s.toJSON());
        sendTransaction(
          window.ship,
          sendable.version,
          serializedSteps,
          sendable.clientID
        );
      }
    },
  });

  authority.onNewSteps.push(function () {
    const newData = authority.stepsSince(getVersion(view.state));
    view.dispatch(
      receiveTransaction(view.state, newData.steps, newData.clientIDs)
    );
  });

  return view;
};
