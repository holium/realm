/* Models */
export type NotesDB_Note = {
  id: string;
  author: string;
  space: string;
  title: string;
  created_at: number;
  updated_at: number;
};

export type NotesDB_NoteEdit = {
  note_edit: string;
  note_id: string;
  id: string;
};

/* Methods */
export type NotesDB_SelectAllNotes = (payload: {
  space: string;
}) => NotesDB_Note[];

export type NotesDB_SelectAllNotesEdits = () => NotesDB_NoteEdit[];

export type NotesDB_SelectAllNoteEdits = (payload: {
  note_id: string;
}) => NotesDB_NoteEdit[];

export type NotesDB_SelectAllLocalNotesEdits = (payload: {
  note_id: string;
}) => NotesDB_NoteEdit[];

export type NotesDB_UpsertNote = (payload: {
  id: string;
  author: string;
  space: string;
  title: string;
}) => string;

export type NotesDB_UpdateNoteTitle = (payload: {
  id: string;
  title: string;
}) => string;

export type NotesDB_UpdateNoteEditId = (payload: {
  note_edit: string;
  id: string;
}) => string;

export type NotesDB_EditNote = (payload: {
  id: string;
  note_id: string;
  note_edit: string;
}) => string;

export type NotesDB_UpsertNoteEdit = (payload: {
  note_edit: string;
  note_id: string;
  id: string;
}) => string;

export type NotesDB_InsertNoteEditLocally = (payload: {
  note_edit: string;
  note_id: string;
}) => string;

export type NotesDB_DeleteNote = (payload: { id: string }) => boolean;

export type NotesDB_DeleteAllUnsavedNoteEdits = (payload: {
  note_id: string;
}) => boolean;
