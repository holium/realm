import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

type SendCaretPosition = (x: number, y: number) => void;

class StreamCaret {
  sendCaretPosition: SendCaretPosition;

  constructor(view: EditorView, sendCaretPosition: SendCaretPosition) {
    this.sendCaretPosition = sendCaretPosition;
    this.update(view, null);
  }

  update(view: EditorView, lastState: EditorView['state'] | null) {
    const state = view.state;
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

    this.sendCaretPosition(x, y);
  }
}

export const streamCaretPlugin = (
  sendCaretPosition: (x: number, y: number) => void
) => {
  return new Plugin({
    view(editorView) {
      return new StreamCaret(editorView, sendCaretPosition);
    },
  });
};
