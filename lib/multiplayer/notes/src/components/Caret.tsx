import { EditorView } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';

type SendCaretPosition = (position: { x: number; y: number }) => void;

export class Caret {
  sendCaretPosition: SendCaretPosition;
  tooltip: HTMLElement;

  constructor(view: EditorView, sendCaretPosition: SendCaretPosition) {
    this.sendCaretPosition = sendCaretPosition;
    this.tooltip = document.createElement('div', {});
    this.tooltip.className = 'tooltip';
    view.dom.parentNode?.appendChild(this.tooltip);

    this.update(view, null);
  }

  update(view: EditorView, lastState: EditorView['state'] | null) {
    let state = view.state;
    // Don't do anything if the document/selection didn't change
    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection)
    )
      return;

    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    const box = this.tooltip.offsetParent?.getBoundingClientRect();
    const left = end.left - 1;
    this.tooltip.style.left = left - (box?.left ?? 0) + 'px';
    this.tooltip.style.bottom = (box?.bottom ?? 0) - start.top - 17 + 'px';
    this.tooltip.style.fontSize = '0px';
    this.tooltip.style.width = '2px';
    this.tooltip.style.height = '18px';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.color = '#fff';
    this.tooltip.style.backgroundColor = '#fff';
    this.sendCaretPosition({ x: left, y: start.top });
  }

  destroy() {
    this.tooltip.remove();
  }
}

export const caretPlugin = (
  sendCaretPosition: (position: { x: number; y: number }) => void
) =>
  new Plugin({
    view(editorView) {
      return new Caret(editorView, sendCaretPosition);
    },
  });
