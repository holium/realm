import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { undo, redo, history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import {
  collab,
  getVersion,
  receiveTransaction,
  sendableSteps,
} from 'prosemirror-collab';
import { Authority } from './Authority';

type SendTransaction = (
  patp: string,
  version: number,
  steps: any,
  clientID: string | number
) => void;

export const collabEditor = (
  authority: Authority,
  place: HTMLElement,
  sendTransaction: SendTransaction
) => {
  let view = new EditorView(place, {
    state: EditorState.create({
      doc: authority.doc,
      plugins: [
        history(),
        keymap({ 'Mod-z': undo, 'Mod-y': redo }),
        keymap(baseKeymap),
        collab({ version: authority.steps.length }),
      ],
    }),
    dispatchTransaction(transaction) {
      let newState = view.state.apply(transaction);
      view.updateState(newState);
      let sendable = sendableSteps(newState);
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
    let newData = authority.stepsSince(getVersion(view.state));
    view.dispatch(
      receiveTransaction(view.state, newData.steps, newData.clientIDs)
    );
  });

  return view;
};

export const applyTransaction = (
  view: EditorView,
  authority: Authority,
  transaction: Transaction
) => {
  const newState = view.state.apply(transaction);
  view.updateState(newState);
  const sendable = sendableSteps(newState);
  if (sendable) {
    authority.receiveSteps(sendable.version, sendable.steps, sendable.clientID);
  }
};

export const applyAndSendTransaction = (
  view: EditorView,
  authority: Authority,
  transaction: Transaction,
  sendTransaction: SendTransaction
) => {
  const newState = view.state.apply(transaction);
  view.updateState(newState);
  const sendable = sendableSteps(newState);
  if (sendable) {
    authority.receiveSteps(sendable.version, sendable.steps, sendable.clientID);

    const serializedSteps = sendable.steps.map((s) => s.toJSON());
    sendTransaction(
      window.ship,
      sendable.version,
      serializedSteps,
      sendable.clientID
    );
  }
};
