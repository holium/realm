import { Schema } from 'prosemirror-model';

export const schema = new Schema({
  nodes: {
    text: {
      group: 'inline',
    },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM() {
        return ['p', 0];
      },
      parseDOM: [{ tag: 'p' }],
    },
    doc: {
      content: 'block+',
    },
  },
});
