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
  ChatDbOps,
  AddRow,
  DelPathsRow,
} from './chat.types';

type ChatUpdateType =
  | 'message-received'
  | 'message-deleted'
  | 'path-added'
  | 'path-deleted'
  | 'peer-added'
  | 'peer-deleted';

type ChatPathMetadata = {
  title?: string;
  creator: string;
  timestamp: string;
};

export type ChatPathType = 'dm' | 'group' | 'space';

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
    'realm.chat.send-message': this.sendMessage,
    'realm.chat.delete-message': this.deleteMessage,
    'realm.chat.read-chat': this.readChat,
    'realm.chat.create-chat': this.createChat,
    'realm.chat.leave-chat': this.leaveChat,
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
    sendMessage: (path: string, fragments: any[]) =>
      ipcRenderer.invoke('realm.chat.send-message', path, fragments),
    deleteMessage: (path: string, msgId: string) =>
      ipcRenderer.invoke('realm.chat.delete-message', path, msgId),
    createChat: (
      peers: string[],
      type: ChatPathType,
      metadata: ChatPathMetadata
    ) => ipcRenderer.invoke('realm.chat.create-chat', peers, type, metadata),
    readChat: (path: string) =>
      ipcRenderer.invoke('realm.chat.read-chat', path),
    leaveChat: (path: string) =>
      ipcRenderer.invoke('realm.chat.leave-chat', path),
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
    this.deletePath = this.deletePath.bind(this);

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

  onDbUpdate(data: ChatDbReactions, _id?: number, mark?: string) {
    console.log(mark);
    if ('tables' in data) {
      this.insertMessages(data.tables.messages);
      this.insertPaths(data.tables.paths);
      this.insertPeers(data.tables.peers);
    } else if (Array.isArray(data)) {
      console.log('db update', data);
      data.forEach(this.handleDBChange);
    } else {
      console.log(data);
    }
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
    } else if (dbChange.type === 'del-paths-row') {
      console.log('del-paths-row', dbChange);
      const delPathsRow = dbChange as DelPathsRow;
      this.deletePath(delPathsRow.row);
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

  deletePath(path: string) {
    if (!this.db) throw new Error('No db connection');
    const deletePath = this.db.prepare('DELETE FROM paths WHERE path = ?');
    console.log('deleting path', path);
    deletePath.run(path);
    // delete all messages in that path
    const deleteMessages = this.db.prepare(
      'DELETE FROM messages WHERE path = ?'
    );
    deleteMessages.run(path);
    // delete all peers in that path
    const deletePeers = this.db.prepare('DELETE FROM peers WHERE path = ?');
    deletePeers.run(path);
  }
  // ----------------------------------------------
  // ----------------- DB queries -----------------
  // ----------------------------------------------

  getChatList() {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      WITH formed_messages AS (
          WITH formed_fragments AS (
              WITH realm_chat as (
                  SELECT *
                  FROM messages
                  WHERE path LIKE '%realm-chat%'
                  ORDER BY msg_part_id, timestamp DESC
              )
              SELECT
                  realm_chat.path,
                  realm_chat.msg_id,
                  realm_chat.msg_part_id,
                  json_object(realm_chat.content_type, realm_chat.content_data) content,
                  realm_chat.sender,
                  realm_chat.timestamp,
                  realm_chat.reply_to,
                  realm_chat.metadata
              FROM realm_chat
              ORDER BY 
                  realm_chat.timestamp DESC, 
                  realm_chat.msg_id DESC, 
                  realm_chat.msg_part_id
          )
          SELECT
              path,
              msg_id,
              msg_part_id,
              json_group_array(content) as contents,
              sender,
              reply_to,
              metadata,
              MAX(timestamp) m_timestamp
          FROM formed_fragments
          GROUP BY msg_id
          ORDER BY m_timestamp DESC, 
                  msg_id DESC, 
                  msg_part_id DESC
      ), chat_with_messages AS (
          SELECT
              path,
              contents lastMessage,
              sender lastSender,
              m_timestamp timestamp
          FROM formed_messages
          GROUP BY formed_messages.path
      )
      SELECT
          paths.path,
          type,
          metadata,
          (
              SELECT json_group_array(ship)
              FROM peers
              WHERE peers.path = paths.path AND ship != ?
          ) AS peers,
          lastMessage,
          lastSender,
          timestamp
      FROM paths
      LEFT JOIN chat_with_messages ON paths.path = chat_with_messages.path
      WHERE paths.path LIKE '%realm-chat%'
      ORDER BY 
          (timestamp IS NULL) DESC, 
          timestamp DESC;
    `);
    const result = query.all(`~${this.core.conduit?.ship}`);

    return result.map((row) => {
      return {
        ...row,
        peers: row.peers ? JSON.parse(row.peers) : null,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        lastMessage: row.lastMessage
          ? JSON.parse(row.lastMessage).map(
              (message: any) => message && JSON.parse(message)
            )
          : null,
      };
    });
  }

  getChatLog(
    _evt: any,
    path: string,
    _params?: { start: number; amount: number }
  ) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      WITH formed_fragments AS (
          WITH realm_chat as (
              SELECT *
              FROM messages
              WHERE path = ?
              ORDER BY msg_part_id, timestamp DESC
          )
          SELECT
              realm_chat.path,
              realm_chat.msg_id,
              realm_chat.msg_part_id,
              json_object(realm_chat.content_type, realm_chat.content_data) content,
              realm_chat.sender,
              realm_chat.timestamp,
              realm_chat.reply_to,
              realm_chat.metadata
          FROM realm_chat
          ORDER BY
              realm_chat.timestamp DESC,
              realm_chat.msg_id DESC,
              realm_chat.msg_part_id
      )
      SELECT
          msg_id,
          json_group_array(content) as contents,
          sender,
          reply_to,
          metadata,
          (
              SELECT json_group_array(ship)
              FROM peers
              WHERE peers.path = formed_fragments.path AND ship != ?
              ) AS peers,
          MAX(formed_fragments.timestamp) timestamp
      FROM formed_fragments
      GROUP BY msg_id
      ORDER BY timestamp;
    `);
    const result = query.all(path, `~${this.core.conduit?.ship}`);
    return result.map((row) => {
      return {
        ...row,
        peers: row.peers ? JSON.parse(row.peers) : null,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        content: row.contents
          ? JSON.parse(row.contents).map((fragment: any) =>
              JSON.parse(fragment)
            )
          : null,
      };
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
      return {
        ...row,
        content: JSON.parse(row.content),
      };
    });
    if (rows.length === 0) return null;
    return rows[0];
  }

  async sendMessage(_evt: any, path: string, fragments: any[]) {
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
    await this.core.conduit.poke(payload);
    return {
      path,
      pending: true,
      content: fragments,
    };
  }

  editMessage(path: string, msgId: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    // this.core.conduit.editChat(path, metadata);
  }

  async deleteMessage(path: string, msgId: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const splitId = msgId.split('~');
    const timestamp = splitId[1];
    const sender = splitId[2];
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'delete-message': {
          'msg-id': [`~${timestamp}`, `~${sender}`],
          path,
        },
      },
    };
    console.log(payload);
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }

  async createChat(
    _evt: any,
    peers: string[],
    type: ChatPathType,
    metadata: ChatPathMetadata
  ) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      reaction: '',
      json: {
        'create-chat': {
          type,
          metadata,
          peers,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }

  readChat(path: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    // this.core.conduit.readChat(path);
  }

  async addShipToChat(_evt: any, path: string, ship: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      reaction: '',
      json: {
        'add-ship-from-chat': {
          ship,
          path,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }

  async removeShipFromChat(_evt: any, path: string, ship: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      reaction: '',
      json: {
        'remove-ship-from-chat': {
          ship,
          path,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }

  /**
   * leaveChat
   *
   * @description calls remove-ship-from-chat with our ship
   * which will remove us from the chat and delete it if we
   * are the host
   *
   * @param _evt
   * @param path
   */
  async leaveChat(_evt: any, path: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      reaction: '',
      json: {
        'remove-ship-from-chat': {
          ship: `~${this.core.conduit?.ship}`,
          path,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }
}
