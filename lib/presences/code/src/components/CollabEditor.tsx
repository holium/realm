import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { undo, redo, history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import {
  collab,
  getVersion,
  receiveTransaction,
  sendableSteps,
} from 'prosemirror-collab';
import { SendTransaction } from '@holium/realm-presences';
import { Authority } from './Authority';
import { streamCaretPlugin } from './Caret';
import { SendCaret } from '../App';

export const collabEditor = (
  authority: Authority,
  place: HTMLElement,
  sendTransaction: SendTransaction,
  sendCaret: SendCaret
) => {
  const view = new EditorView(place, {
    state: EditorState.create({
      doc: authority.doc,
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
      ],
    }),
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction);
      view.updateState(newState);
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
