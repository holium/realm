export type NotesDB_UpsertNote = (payload: {
  id: string;
  author: string;
  space: string;
  title: string;
}) => string;

export type NotesDB_Note = {
  id: string;
  author: string;
  space: string;
  title: string;
  created_at: number;
  updated_at: number;
};

export type NotesDB_SelectAllNotes = (payload: {
  space: string;
}) => NotesDB_Note[];

export type NotesDB_SelectAllNotesUpdates = () => {
  id: string;
  note_id: string;
  note_update: string;
}[];

export type NotesDB_SelectAllLocalNotesUpdates = (payload: {
  note_id: string;
}) => {
  id: string;
  space: string;
  note_id: string;
  note_update: string;
}[];

export type NotesDB_SelectAllNoteUpdates = (payload: { note_id: string }) => {
  id: string;
  note_id: string;
  note_update: string;
}[];

export type NotesDB_UpdateTitle = (payload: {
  id: string;
  title: string;
}) => string;

export type NotesDB_EditNote = (payload: {
  id: string;
  note_id: string;
  update: string;
}) => string;

export type NotesDB_InsertNoteUpdate = (payload: {
  id: string;
  note_id: string;
  update: string;
}) => string;

export type NotesDB_InsertNoteUpdateLocally = (payload: {
  space: string;
  note_id: string;
  update: string;
}) => string;

export type NotesDB_DeleteNote = (payload: { id: string }) => boolean;

export type NotesDB_DeleteAllLocalNoteUpdates = (payload: {
  note_id: string;
}) => boolean;
