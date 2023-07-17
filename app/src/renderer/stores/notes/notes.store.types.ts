import { Instance, types } from 'mobx-state-tree';
import { Node } from 'prosemirror-model';

import { JSONObject } from 'os/types';

export const NoteModel = types.model('NoteModel', {
  id: types.identifier,
  author: types.string,
  space: types.string,
  title: types.string,
  doc: types.frozen<Node>(),
  created_at: types.number,
  updated_at: types.number,
});

export type NotesStore_Note = Instance<typeof NoteModel>;

/* Notes Store Public Methods */
export type NotesStore_CreateNote = {
  title: string;
  doc: JSONObject;
  space: string;
};

export type NotesStore_DeleteNote = {
  id: string;
  space: string;
};

export type NotesStore_LoadLocalNotes = {
  space: string;
};

export type NotesStore_SubscribeToBedrockUpdates = {
  space: string;
};

export type NotesStore_SetSelectedNoteId = {
  id: string | null;
};

export type NotesStore_GetNote = {
  id: string;
};

export type NotesStore_PersistLocalNoteChanges = {
  id: string;
};

/* Notes Store Private Methods */
export type NotesStore_InsertNoteLocally = {
  note: NotesStore_Note;
};

export type NotesStore_UpdateNoteLocally = {
  id: string;
  title?: string;
  doc?: Node;
};

export type NotesStore_DeleteNoteLocally = {
  id: string;
};
