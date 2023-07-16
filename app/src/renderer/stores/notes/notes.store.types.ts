import { Instance, types } from 'mobx-state-tree';
import { Node } from 'prosemirror-model';

import { JSONObject } from 'os/types';

export const NoteModel = types.model('NoteModel', {
  id: types.number,
  bedrockId: types.string,
  author: types.string,
  space: types.string,
  title: types.string,
  doc: types.frozen<Node>(),
  created_at: types.number,
  updated_at: types.number,
});

export type NotesStore_Note = Instance<typeof NoteModel>;

export type NotesStore_CreateNote = {
  title: string;
  doc: JSONObject;
  space: string;
};
