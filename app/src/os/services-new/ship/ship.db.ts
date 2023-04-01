import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import sqlite3 from 'better-sqlite3-multiple-ciphers';
import log from 'electron-log';
import { notifInitSql } from './models/notifications.model';
import { chatInitSql } from './models/chat.model';

export class ShipDB {
  private shipDB: sqlite3.Database;
  private patp: string;
  private readonly dbPath: string;
  private readonly isDev: boolean = process.env.NODE_ENV === 'development';

  constructor(patp: string, password: string) {
    // Open the authentication database
    this.patp = patp;
    this.dbPath = path.join(
      app.getPath('userData'),
      `realm.${patp}`,
      `${patp}.sqlite`
    );
    if (!fs.existsSync(this.dbPath)) {
      this.shipDB = this.open();
      // Create the database if it doesn't exist
      log.info('ship db file doesnt exist');
      if (this.isDev) {
        this.shipDB.exec(initSql);
        return;
      } else {
        this.shipDB.pragma(`rekey='${password}'`);
        this.shipDB.pragma(`cipher='sqlcipher'`);
        this.shipDB.pragma(`legacy=4`);
        this.shipDB.exec(initSql);
        this.shipDB.pragma(`key='${password}'`);
      }
    } else {
      log.info('ship db file exists');
      this.shipDB = this.open();
      this.decrypt(password);
    }
  }

  get db() {
    return this.shipDB;
  }

  getCredentials() {
    const result = this.shipDB
      .prepare('SELECT * FROM credentials LIMIT 1;')
      .get();
    return { ...result, ship: this.patp };
  }

  setCredentials(url: string, code: string, cookie: string) {
    this.shipDB
      .prepare(
        'INSERT OR REPLACE INTO credentials (url, code, cookie) VALUES (?, ?, ?);'
      )
      .run(url, code, cookie);
  }

  open() {
    return new sqlite3(this.dbPath);
  }

  decrypt(password: string) {
    !this.isDev && this.shipDB.pragma(`key='${password}'`);
  }

  getMessages() {
    return this.shipDB.prepare('SELECT * FROM messages;').all();
  }

  async disconnect(): Promise<void> {
    this.shipDB.close();
  }
}

const initSql = `
${chatInitSql}
${notifInitSql}
create table if not exists credentials (
  url       text primary key,
  code      text,
  cookie    text,
  wallet    text
);
create unique index if not exists credentials_url_uindex on credentials (url);
`;
