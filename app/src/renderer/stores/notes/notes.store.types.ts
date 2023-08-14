import { Instance, types } from 'mobx-state-tree';

export const NoteModel = types.model('NoteModel', {
  id: types.identifier,
  author: types.string,
  space: types.string,
  title: types.string,
  created_at: types.number,
  updated_at: types.number,
});

export type NotesStore_Note = Instance<typeof NoteModel>;

/* notes.store.ts Public Methods */
export type NotesStore_CreateNote = {
  space: string;
  title: string;
};

export type NotesStore_DeleteNote = {
  id: string;
  space: string;
};

export type NotesStore_LoadLocalNotes = {
  space: string;
};

export type NotesStore_SetSelectedNoteId = {
  id: string | null;
};

export type NotesStore_GetNote = {
  id: string;
};

export type NotesStore_EditNoteTitle = {
  title: string;
};

export type NotesStore_CreateNoteUpdate = {
  note_edit: string;
  note_id: string;
  space: string;
};

export type NotesStore_CreateNoteUpdateLocally = Omit<
  NotesStore_CreateNoteUpdate,
  'space'
>;

export type NotesStore_SaveLocalNoteUpdates = {
  note_id: string;
  space: string;
};

/* notes.store.ts Private Methods */
export type NotesStore_InsertNoteLocally = {
  note: NotesStore_Note;
};

export type NotesStore_ApplyNoteEditLocally = {
  note_id: string;
  note_edit: string;
};

export type NotesStore_UpdateNoteLocally = {
  id: string;
  title: string;
};

export type NotesStore_DeleteNoteLocally = {
  id: string;
};
