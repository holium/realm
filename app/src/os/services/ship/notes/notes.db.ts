import { app } from 'electron';
import Database from 'better-sqlite3-multiple-ciphers';
import path from 'path';

import {
  NotesDB_Delete,
  NotesDB_Insert,
  NotesDB_SelectAll,
  NotesDB_Update,
} from './notes.db.types';

export const notesInitSql = `
  create table if not exists notes (
      id          TEXT PRIMARY KEY,
      author      TEXT NOT NULL,
      space       TEXT NOT NULL,
      title       TEXT NOT NULL,
      doc         TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
  );
`;

export class NotesDB {
  private notesDB: Database;

  constructor(patp: string) {
    const dbPath = path.join(app.getPath('userData'), `${patp}.sqlite`);

    // Create the database if it doesn't exist
    this.notesDB = new Database(dbPath);
    this.notesDB.exec(notesInitSql);
  }

  get db() {
    return this.notesDB;
  }

  disconnect() {
    this.notesDB.close();
  }

  selectAll: NotesDB_SelectAll = ({ space }) => {
    const notes = this.notesDB
      .prepare(`SELECT * FROM notes WHERE space = ?`)
      .all(space);

    return notes.map((note) => ({
      ...note,
      doc: JSON.parse(note.doc),
    }));
  };

  upsert: NotesDB_Insert = ({ id, title, doc, space, author }) => {
    // If the note already exists, update it.
    const existingNote = this.notesDB
      .prepare(`SELECT * FROM notes WHERE id = ?`)
      .get(id);

    if (existingNote) {
      return this.update({ id, title, doc });
    }

    const info = this.notesDB
      .prepare(
        `INSERT INTO notes (id, title, doc, space, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        title,
        JSON.stringify(doc),
        space,
        author,
        Date.now(),
        Date.now()
      );
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  update: NotesDB_Update = ({ id, title, doc }) => {
    const info = this.notesDB
      .prepare(
        `UPDATE notes SET title = ?, doc = ?, updated_at = ? WHERE id = ?`
      )
      .run(title, JSON.stringify(doc), Date.now(), id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };

  delete: NotesDB_Delete = ({ id }) => {
    const info = this.notesDB.prepare(`DELETE FROM notes WHERE id = ?`).run(id);
    const noteId = info.lastInsertRowid;

    return noteId;
  };
}
