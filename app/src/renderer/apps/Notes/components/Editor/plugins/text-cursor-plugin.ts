import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const textCursorPlugin = () => {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'paragraph') {
            decorations.push(
              Decoration.node(pos, pos + node.nodeSize, {
                class: 'text-cursor',
              })
            );
          }
        });
        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
};
