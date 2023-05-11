// import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../../../abstract.db';
import { CreateBookmarkPayload } from '../spaces.types';

export type Bookmark = {
  path: string;
  url: string;
  title: string;
  favicon: string;
  color: string;
};

export class BookmarksDB extends AbstractDataAccess<Bookmark, any> {
  constructor(preload: boolean, db?: Database) {
    super({
      preload: preload,
      db,
      name: 'bookmarksDB',
      tableName: 'bookmarks',
    });
    if (preload) {
      return;
    }
  }

  protected mapRow(row: any): Bookmark {
    return {
      path: row.path,
      url: row.url,
      title: row.title,
      favicon: row.favicon,
      color: row.color,
    };
  }

  public getAll(): { [key: string]: Bookmark } {
    if (!this.db?.open) return {};
    const query = this.db.prepare(`SELECT * FROM bookmarks`);
    const result = query.all();
    const bookmarks: { [key: string]: Bookmark } = {};
    for (const row of result) {
      bookmarks[row.path] = this.mapRow(row);
    }
    return bookmarks;
  }

  public insertAll(bookmarks: { [key: string]: Bookmark }) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO bookmarks (url, path) VALUES (@url, @path)`
    );

    const insertMany = this.db.transaction((bookmarks: Bookmark[]) => {
      for (const bookmark of bookmarks) insert.run(bookmark);
    });
    insertMany(Object.values(bookmarks));
  }

  addBookmark(payload: CreateBookmarkPayload) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO bookmarks (url, path, title, favicon, color) VALUES (@url, @path, @title, @favicon, @color)`
    );
    insert.run(payload);
  }

  removeBookmark(path: string, url: string) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `DELETE FROM bookmarks WHERE url = @url AND path = @path`
    );
    insert.run({ url, path });
  }
}

export const bookmarksInitSql = `
  create table if not exists bookmarks (
    path text not null,
    url text not null unique,
    title text,
    favicon text,
    color text
  );
`;

export const bookmarksDBPreload = BookmarksDB.preload(new BookmarksDB(true));
