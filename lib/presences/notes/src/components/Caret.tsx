import { EditorView } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';

type SendCaretPosition = (position: { x: number; y: number }) => void;

class StreamCaret {
  sendCaretPosition: SendCaretPosition;

  constructor(view: EditorView, sendCaretPosition: SendCaretPosition) {
    this.sendCaretPosition = sendCaretPosition;
    this.update(view, null);
  }

  update(view: EditorView, lastState: EditorView['state'] | null) {
    let state = view.state;
    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection)
    ) {
      // Don't do anything if the document/selection didn't change
      return;
    }

    const { from, to } = state.selection;
    const y = view.coordsAtPos(from).top;
    const x = view.coordsAtPos(to).left - 1;

    this.sendCaretPosition({ x, y });
  }
}

export const streamCaretPlugin = (
  sendCaretPosition: (position: { x: number; y: number }) => void
) => {
  return new Plugin({
    view(editorView) {
      return new StreamCaret(editorView, sendCaretPosition);
    },
  });
};
