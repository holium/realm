import { Instance, types } from 'mobx-state-tree';

export const NoteModel = types.model('NoteModel', {
  id: types.identifier,
  author: types.string,
  space: types.string,
  title: types.string,
  history: types.array(types.string),
  created_at: types.number,
  updated_at: types.number,
});

export type NotesStore_Note = Instance<typeof NoteModel>;

/* Notes Store Public Methods */
export type NotesStore_CreateNote = {
  title: string;
  history: string[];
  space: string;
};

export type NotesStore_DeleteNote = {
  id: string;
  space: string;
};

export type NotesStore_UpdateNote = {
  id: string;
  title?: string;
  history?: string[];
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

/* Notes Store Private Methods */
export type NotesStore_InsertNoteLocally = {
  note: NotesStore_Note;
};

export type NotesStore_UpdateNoteLocally = {
  id: string;
  title?: string;
  history?: string[];
};

export type NotesStore_DeleteNoteLocally = {
  id: string;
};
