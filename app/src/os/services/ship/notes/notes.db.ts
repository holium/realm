import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../abstract.db';
import {
  NotesDB_DeleteNote,
  NotesDB_EditNote,
  NotesDB_Note,
  NotesDB_SelectAllNotes,
  NotesDB_SelectAllNotesUpdates,
  NotesDB_SelectAllNoteUpdates,
  NotesDB_UpdateTitle,
  NotesDB_UpsertNote,
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

create table if not exists notes_updates (
  id              TEXT PRIMARY KEY,
  note_id         TEXT NOT NULL,
  note_update     TEXT NOT NULL
);
`;

export const notesWipeSql = `
drop table if exists notes;
drop table if exists notes_updates;
`;

export class NotesDB extends AbstractDataAccess<any> {
  constructor(params: DataAccessContructorParams) {
    params.name = 'notesDB';
    params.tableName = 'notes';
    params.tableName = 'notes_updates';
    super(params);
    this.db?.exec(notesInitSql);
    if (params.preload) return;
    this._onError = this._onError.bind(this);
    this._onDbUpdate = this._onDbUpdate.bind(this);
  }

  private _onError(err: any) {
    console.log('err!', err);
  }

  private _onDbUpdate(data: any) {
    const type = Object.keys(data)[0];
    console.log('_onDbUpdate', type);
    // if (type === 'note') {
    //   this._insertWallets({ [data.wallet.key]: data.wallet });
    // } else if (type === 'note-update') {
    //   this._insertTransactions([data.transaction]);
    // }
    // this.sendUpdate(data);
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

  selectAllNotesUpdates: NotesDB_SelectAllNotesUpdates = () => {
    if (!this.db) return [];
    const notes = this.db.prepare(`SELECT * FROM notes_updates`).all();

    return notes;
  };

  selectNoteUpdates: NotesDB_SelectAllNoteUpdates = ({ note_id }) => {
    if (!this.db) return [];
    const notes = this.db
      .prepare(`SELECT * FROM notes_updates WHERE note_id = ?`)
      .all(note_id);

    return notes;
  };

  upsertNote: NotesDB_UpsertNote = ({ id, title, space, author }) => {
    if (!this.db) return -1;

    // TODO: transaction-ify the title as well.
    // If the note already exists, update the title.
    const existingNote = this.db
      .prepare(`SELECT * FROM notes WHERE id = ?`)
      .get(id);
    if (existingNote) {
      return this.updateTitle({ id, title });
    }

    const info = this.db
      .prepare(
        `INSERT INTO notes (id, title, space, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(id, title, space, author, Date.now(), Date.now());
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  insertNoteUpdate: NotesDB_EditNote = ({ id, note_id, update }) => {
    if (!this.db) return -1;

    // If the note update already exists, do nothing.
    const existingNoteUpdate = this.db
      .prepare(`SELECT * FROM notes_updates WHERE id = ?`)
      .get(id);
    if (existingNoteUpdate) {
      return -1;
    }

    const info = this.db
      .prepare(
        `INSERT INTO notes_updates (id, note_id, note_update) VALUES (?, ?, ?)`
      )
      .run(id, note_id, update);
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  updateTitle: NotesDB_UpdateTitle = ({ id, title }) => {
    if (!this.db) return -1;
    const info = this.db
      .prepare(`UPDATE notes SET title = ?, updated_at = ? WHERE id = ?`)
      .run(title, Date.now(), id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  deleteNote: NotesDB_DeleteNote = ({ id }) => {
    if (!this.db) return false;
    const notesInfo = this.db.prepare(`DELETE FROM notes WHERE id = ?`).run(id);
    const notesId = notesInfo.lastInsertRowid;

    const notesUpdatesInfo = this.db
      .prepare(`DELETE FROM notes_updates WHERE note_id = ?`)
      .run(id);
    const noteUpdatesId = notesUpdatesInfo.lastInsertRowid;

    return Boolean(notesId && noteUpdatesId);
  };

  deleteNoteUpdate: NotesDB_DeleteNote = ({ id }) => {
    if (!this.db) return -1;
    const info = this.db
      .prepare(`DELETE FROM notes_updates WHERE id = ?`)
      .run(id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };
}
