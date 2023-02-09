import { ipcRenderer, app } from 'electron';
import { EventEmitter } from 'stream';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Patp } from '../../types';
import Realm from '../..';
import { ChatDBReactions, MessagesRow, PathsRow, PeersRow } from './chat.types';

export class ChatService extends EventEmitter {
  core: Realm;
  options: any;
  db: Database.Database | null = null;
  initSql = fs.readFileSync(`${path.resolve(__dirname)}/init.sql`, 'utf8');
  lastTimestamp = 0;

  constructor(core: Realm, options: any = {}) {
    super();
    this.core = core;
    this.options = options;
    this.onQuit = this.onQuit.bind(this);
    this.onError = this.onError.bind(this);
    this.onDBUpdate = this.onDBUpdate.bind(this);
  }

  async subscribe(ship: Patp) {
    this.db = new Database(`${app.getPath('userData')}/realm.${ship}/chat.db`, {
      // verbose: console.log,
    });
    this.db.exec(this.initSql);
    // let path = '/db'
    // if (lastTimestamp !== 0) {
    //   path= `/db?since=${lastTimestamp}`
    // }
    await this.core.conduit!.watch({
      app: 'chat-db',
      path: '/db',
      onEvent: this.onDBUpdate,
      onQuit: this.onQuit,
      onError: this.onError,
    });
  }

  onDBUpdate(data: ChatDBReactions) {
    if ('tables' in data) {
      this.insertMessages(data.tables.messages);
      this.insertPaths(data.tables.paths);
      this.insertPeers(data.tables.peers);
      return;
    } else if (data.type === 'add-row') {
      if (data.table === 'messages') {
        this.insertMessages(data.row as MessagesRow[]);
      }
      if (data.table === 'paths') {
        this.insertPaths(data.row as PathsRow[]);
      }
      if (data.table === 'peers') {
        this.insertPeers(data.row as PeersRow[]);
      }
      return;
    } else {
      console.log(data);
      return;
    }

    // if (data.type === 'del-peers-row') {
    //   this.deletePeersRow(data.path);
    //   return;
    // }
    // if (data.type === 'del-paths-row') {
    //   this.deletePathsRow(data.path);
    //   return;
    // }
    // if (data.type === 'del-messages-row') {
    //   this.deleteMessagesRow(data.id);
    //   return;
    // }
    // console.log(data);
  }
  onQuit() {
    console.log('fail!');
  }
  onError(err: any) {
    console.log('err!', err);
  }

  insertMessages(messages: MessagesRow[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `INSERT OR IGNORE INTO messages (
        path, 
        msg_id, 
        msg_part_id, 
        content_type, 
        content_data, 
        reply_to, 
        metadata, 
        timestamp, 
        sender) 
      VALUES (
        @path, 
        @msg_id, 
        @msg_part_id,
        @content_type,
        @content_data,
        @reply_to,
        @metadata,
        @timestamp,
        @sender
      )`
    );
    const insertMany = this.db.transaction((messages) => {
      for (const message of messages) {
        insert.run({
          path: message.path,
          msg_id: `${message['msg-id'][0]}${message['msg-id'][1]}`,
          msg_part_id: message['msg-part-id'],
          content_type: Object.keys(message.content)[0],
          content_data: Object.values(message.content)[0],
          reply_to: message['reply-to'],
          metadata: JSON.stringify(message.metadata),
          timestamp: message.timestamp,
          sender: message['msg-id'][1],
        });
      }
    });
    insertMany(messages);
  }

  insertPaths(paths: PathsRow[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      'INSERT OR IGNORE INTO paths (path, type, metadata) VALUES (@path, @type, @metadata)'
    );
    const insertMany = this.db.transaction((paths) => {
      for (const path of paths)
        insert.run({
          path: path.path,
          type: path.type,
          metadata: JSON.stringify(path.metadata),
        });
    });
    insertMany(paths);
  }

  insertPeers(peers: PeersRow[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      'INSERT OR IGNORE INTO peers (path, ship, role) VALUES (@path, @ship, @role)'
    );
    const insertMany = this.db.transaction((peers) => {
      for (const peer of peers)
        insert.run({
          path: peer.path,
          ship: peer.ship,
          role: peer.role,
        });
    });
    insertMany(peers);
  }

  /**
   * Preload functions to register with the renderer
   */
  static preload = {
    sendSlip: async (to: Patp[], data: any) =>
      await ipcRenderer.invoke('realm.slip.send', to, data),
    onSlip: (callback: any) => ipcRenderer.on('realm.on-slip', callback),
  };
}
