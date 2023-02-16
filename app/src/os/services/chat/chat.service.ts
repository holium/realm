import { ipcMain, ipcRenderer, app, IpcRendererEvent } from 'electron';
import { BaseService } from '../base.service';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Patp } from '../../types';
import { Realm } from '../..';
import {
  ChatDbReactions,
  MessagesRow,
  PathsRow,
  PeersRow,
  DbChangeType,
  ChatDbOps,
  AddRow,
} from './chat.types';

type ChatUpdateType =
  | 'message-received'
  | 'message-deleted'
  | 'path-added'
  | 'path-deleted'
  | 'peer-added'
  | 'peer-deleted';

export class ChatService extends BaseService {
  db: Database.Database | null = null;
  initSql = fs.readFileSync(`${path.resolve(__dirname)}/init.sql`, 'utf8');
  lastTimestamp = 0;

  /**
   * Handlers for the ipcRenderer invoked functions
   **/
  handlers = {
    'realm.chat.get-chat-list': this.getChatList,
    'realm.chat.get-chat-log': this.getChatLog,
    'realm.chat.send-chat': this.sendChat,
    'realm.chat.read-chat': this.readChat,
  };

  /**
   * Preload functions to register with the renderer
   */
  static preload = {
    getChatList: async () =>
      await ipcRenderer.invoke('realm.chat.get-chat-list'),
    getChatLog: async (
      path: string,
      params?: { start: number; amount: number }
    ) => await ipcRenderer.invoke('realm.chat.get-chat-log', path, params),
    sendChat: (path: string, fragments: any[]) =>
      ipcRenderer.invoke('realm.chat.send-chat', path, fragments),
    readChat: async (path: string) =>
      await ipcRenderer.invoke('realm.chat.read-chat', path),
    onDbChange: (
      callback: (evt: IpcRendererEvent, type: ChatUpdateType, data: any) => void
    ) => ipcRenderer.on('realm.chat.on-db-change', callback),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.onQuit = this.onQuit.bind(this);
    this.onError = this.onError.bind(this);

    this.onDbUpdate = this.onDbUpdate.bind(this);
    this.handleDBChange = this.handleDBChange.bind(this);
    this.sendChatUpdate = this.sendChatUpdate.bind(this);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }
  // ----------------------------------------------
  // ----------------- DB setup -------------------
  // ----------------------------------------------
  async subscribe(ship: Patp) {
    this.db = new Database(`${app.getPath('userData')}/realm.${ship}/chat.db`, {
      // verbose: console.log,
    });
    this.db.exec(this.initSql);
    // get the last index
    // scry with the last index

    // let path = '/db'
    // if (lastTimestamp !== 0) {
    //   path= `/db?since=${lastTimestamp}`
    // }
    await this.core.conduit!.watch({
      app: 'chat-db',
      path: '/db',
      onEvent: this.onDbUpdate,
      onQuit: this.onQuit,
      onError: this.onError,
    });
  }

  onDbUpdate(data: ChatDbReactions) {
    if ('tables' in data) {
      this.insertMessages(data.tables.messages);
      this.insertPaths(data.tables.paths);
      this.insertPeers(data.tables.peers);
    } else if (Array.isArray(data)) {
      data.forEach(this.handleDBChange);
    } else {
      console.log(data);
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

  handleDBChange(dbChange: ChatDbOps) {
    if (dbChange.type === 'add-row') {
      const addRow = dbChange as AddRow;
      switch (addRow.table) {
        case 'messages':
          // console.log('add-row to messages', addRow.row);
          const message = addRow.row as MessagesRow;
          this.insertMessages([message]);
          const msg = this.getChatMessage(
            message.path,
            `${message['msg-id'][0]}${message['msg-id'][1]}`
          );
          console.log('NEW MESSAGE', msg);
          this.sendChatUpdate('message-received', msg);
          break;
        case 'paths':
          console.log('add-row to paths', addRow.row);
          const paths = [addRow.row] as PathsRow[];
          this.insertPaths(paths);
          break;
        case 'peers':
          console.log('add-row to peers', addRow.row);
          const peers = [addRow.row] as PeersRow[];

          this.insertPeers(peers);
          break;
      }
    }
  }

  sendChatUpdate(type: ChatUpdateType, data: any) {
    this.core.mainWindow.webContents.send(
      'realm.chat.on-db-change',
      type,
      data
    );
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
  // ----------------------------------------------
  // ----------------- DB queries -----------------
  // ----------------------------------------------

  getChatList() {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
        SELECT path,
              msg_id id,
              MAX(json_object(content_type, content_data)) lastMessage,
              sender,
              MAX(timestamp) as                            timestamp
        FROM (SELECT path,
                    msg_id,
                    content_type,
                    content_data,
                    sender,
                    MAX(timestamp) as timestamp
              FROM messages
              WHERE path LIKE '%realm-chat%'
                and sender != ?
              GROUP BY msg_id
              ORDER BY timestamp DESC
              LIMIT 1)
        GROUP BY path
        ORDER BY timestamp DESC;
    `);
    const result = query.all(`~${this.core.conduit?.ship}`);

    return result.map((row) => {
      return { ...row, lastMessage: JSON.parse(row.lastMessage) };
    });
  }

  getChatLog(
    _evt: any,
    path: string,
    params?: { start: number; amount: number }
  ) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT
        path,
        msg_id id,
        json_group_array(json_object(content_type, content_data)) content,
        sender,
        MAX(timestamp) as timestamp
      FROM (SELECT path,
                  msg_id,
                  content_type,
                  content_data,
                  sender,
                  timestamp
            FROM messages
            WHERE path = ?
            ORDER BY msg_id, msg_part_id)
      GROUP BY msg_id
      ORDER BY timestamp;
    `);
    const result = query.all(path);
    return result.map((row) => {
      return { ...row, content: JSON.parse(row.content) };
    });
  }

  getChatMessage(path: string, msgId: string) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT
        path,
        msg_id id,
        json_group_array(json_object(content_type, content_data)) content,
        sender,
        MAX(timestamp) as timestamp
      FROM (SELECT path,
                  msg_id,
                  content_type,
                  content_data,
                  sender,
                  timestamp
            FROM messages
            WHERE path = ? AND msg_id = ?
            ORDER BY msg_id, msg_part_id)
      GROUP BY msg_id
      ORDER BY timestamp;
    `);
    const result = query.all(path, msgId);
    const rows = result.map((row) => {
      return { ...row, content: JSON.parse(row.content) };
    });
    if (rows.length === 0) return null;
    return rows[0];
  }

  async sendChat(_evt: any, path: string, fragments: any[]) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'send-message': {
          path: path,
          fragments,
        },
      },
    };
    const result = await this.core.conduit.poke(payload);
    return {
      path,
      pending: true,
      content: fragments,
    };
    // this.core.conduit.sendChat(path, fragments);
  }

  readChat(path: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    // this.core.conduit.readChat(path);
  }
}
