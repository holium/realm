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

export type NotesDB_UpdateTitle = (payload: {
  id: string;
  title: string;
}) => string;

export type NotesDB_EditNote = (payload: {
  id: string;
  note_id: string;
  update: string;
}) => string;

export type NotesDB_DeleteNote = (payload: { id: string }) => string;
