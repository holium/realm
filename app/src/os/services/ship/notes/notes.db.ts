import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../abstract.db';
import {
  NotesDB_DeleteNote,
  NotesDB_InsertNoteEditLocally,
  NotesDB_Note,
  NotesDB_ReplaceUnsavedNoteEditsWithOne,
  NotesDB_SelectAllLocalNotesEdits,
  NotesDB_SelectAllNoteEdits,
  NotesDB_SelectAllNotes,
  NotesDB_SelectAllNotesEdits,
  NotesDB_UpdateNoteEditId,
  NotesDB_UpdateNoteTitle,
  NotesDB_UpsertNote,
  NotesDB_UpsertNoteEdit,
} from './notes.db.types';

export const notesInitSql = `
create table if not exists notes (
  id          TEXT PRIMARY KEY,
  author      TEXT NOT NULL,
  space       TEXT NOT NULL,
  title       TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

create table if not exists notes_edits (
  id              TEXT,
  note_edit       TEXT NOT NULL,
  note_id         TEXT NOT NULL
);

create index if not exists notes_edits_note_edit_note_id on notes_edits (note_edit, note_id);
`;

export const notesWipeSql = `
drop table if exists notes;
drop table if exists notes_edits;
`;

export class NotesDB extends AbstractDataAccess<any> {
  constructor(params: DataAccessContructorParams) {
    params.name = 'notesDB';
    params.tableName = 'notes';
    params.tableName = 'notes_edits';
    super(params);
    this.db?.exec(notesInitSql);
  }

  protected mapRow(row: any): NotesDB_Note {
    return {
      id: row.id,
      author: row.author,
      space: row.space,
      title: row.title,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  disconnect() {
    this.db?.close();
  }

  selectAllNotes: NotesDB_SelectAllNotes = ({ space }) => {
    if (!this.db) return [];
    const notes = this.db
      .prepare(`SELECT * FROM notes WHERE space = ?`)
      .all(space);

    return notes;
  };

  selectAllNotesEdits: NotesDB_SelectAllNotesEdits = () => {
    if (!this.db) return [];
    const notes = this.db.prepare(`SELECT * FROM notes_edits`).all();

    return notes;
  };

  selectAllUnsavedNoteEdits: NotesDB_SelectAllLocalNotesEdits = ({
    note_id,
  }) => {
    if (!this.db) return [];

    // Null id means it's an unsaved edit.
    const notes = this.db
      .prepare(`SELECT * FROM notes_edits WHERE note_id = ? AND id IS NULL`)
      .all(note_id);

    return notes ?? [];
  };

  selectNoteEdits: NotesDB_SelectAllNoteEdits = ({ note_id }) => {
    if (!this.db) return [];
    const notes = this.db
      .prepare(`SELECT * FROM notes_edits WHERE note_id = ?`)
      .all(note_id);

    return notes;
  };

  upsertNote: NotesDB_UpsertNote = ({ id, title, space, author }) => {
    if (!this.db) return -1;

    // If the note already exists, update the title.
    const existingNote = this.db
      .prepare(`SELECT * FROM notes WHERE id = ?`)
      .get(id);
    if (existingNote) {
      return this.updateNoteTitle({ id, title });
    }

    const info = this.db
      .prepare(
        `INSERT INTO notes (id, title, space, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(id, title, space, author, Date.now(), Date.now());
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  upsertNoteEdit: NotesDB_UpsertNoteEdit = ({ note_edit, note_id, id }) => {
    if (!this.db) return -1;

    // If the note edit already exists, update the id.
    const existingNoteEdit = this.db
      .prepare(`SELECT * FROM notes_edits WHERE note_edit = ? AND note_id = ?`)
      .get(note_edit, note_id);
    if (existingNoteEdit) {
      return this.updateNoteEditId({ note_edit, note_id, id });
    }

    // Otherwise, insert a new note edit.
    const info = this.db
      .prepare(
        `INSERT INTO notes_edits (note_edit, note_id, id) VALUES (?, ?, ?)`
      )
      .run(note_edit, note_id, id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  insertNoteEditLocally: NotesDB_InsertNoteEditLocally = ({
    note_edit,
    note_id,
  }) => {
    if (!this.db) return -1;

    // If the note edit already exists, do nothing.
    const existingNoteEdit = this.db
      .prepare(`SELECT * FROM notes_edits WHERE note_edit = ? AND note_id = ?`)
      .get(note_edit, note_id);
    if (existingNoteEdit) {
      return existingNoteEdit.id;
    }

    const info = this.db
      .prepare(`INSERT INTO notes_edits (note_edit, note_id) VALUES (?, ?)`)
      .run(note_edit, note_id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  updateNoteTitle: NotesDB_UpdateNoteTitle = ({ id, title }) => {
    if (!this.db) return -1;
    const info = this.db
      .prepare(`UPDATE notes SET title = ?, updated_at = ? WHERE id = ?`)
      .run(title, Date.now(), id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  updateNoteEditId: NotesDB_UpdateNoteEditId = ({ note_edit, note_id, id }) => {
    if (!this.db) return -1;
    const info = this.db
      .prepare(
        `UPDATE notes_edits SET id = ? WHERE note_edit = ? AND note_id = ?`
      )
      .run(id, note_edit, note_id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  deleteNote: NotesDB_DeleteNote = ({ id }) => {
    if (!this.db) return false;
    const notesInfo = this.db.prepare(`DELETE FROM notes WHERE id = ?`).run(id);
    const notesId = notesInfo.lastInsertRowid;

    const notesEditsInfo = this.db
      .prepare(`DELETE FROM notes_edits WHERE note_id = ?`)
      .run(id);
    const noteEditsId = notesEditsInfo.lastInsertRowid;

    return Boolean(notesId && noteEditsId);
  };

  replaceUnsavedNoteEditsWithOne: NotesDB_ReplaceUnsavedNoteEditsWithOne = ({
    note_edit,
    note_id,
  }) => {
    if (!this.db) return false;

    const info = this.db.transaction(() => {
      if (!this.db) return false;

      const res1 = this.db
        .prepare(`DELETE FROM notes_edits WHERE note_id = ? AND id IS NULL`)
        .run(note_id);
      const res2 = this.db
        .prepare(`INSERT INTO notes_edits (note_edit, note_id) VALUES (?, ?)`)
        .run(note_edit, note_id);

      return Boolean(res1 && res2);
    })();

    return info;
  };
}
