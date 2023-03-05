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
  // DelPeersRow,
  UpdateRow,
  DelMessagesRow,
  DeleteLogRow,
  DelPeersRow,
  UpdateMessage,
} from './chat.types';

type ChatUpdateType =
  | 'message-received'
  | 'message-edited'
  | 'message-deleted'
  | 'path-added'
  | 'path-deleted'
  | 'peer-added'
  | 'peer-deleted';

export type ChatPathMetadata = {
  title: string;
  description?: string;
  image?: string;
  creator: string;
  timestamp: string;
  reactions?: string;
};

const parseMetadata = (metadata: string) => {
  const mtd = JSON.parse(metadata);
  return {
    ...mtd,
    timestamp: parseInt(mtd.timestamp) || 0,
    reactions: mtd.reactions === 'true',
  };
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
    'realm.chat.get-chat-peers': this.getChatPeers,
    'realm.chat.send-message': this.sendMessage,
    'realm.chat.edit-message': this.editMessage,
    'realm.chat.delete-message': this.deleteMessage,
    // 'realm.chat.read-chat': this.readChat,
    'realm.chat.create-chat': this.createChat,
    'realm.chat.edit-chat': this.editChatMetadata,
    'realm.chat.fetch-pinned-chats': this.fetchPinnedChats,
    'realm.chat.toggle-pinned-chat': this.togglePinnedChat,
    'realm.chat.set-pinned-message': this.setPinnedMessage,
    'realm.chat.clear-pinned-message': this.clearPinnedMessage,
    'realm.chat.clear-chat-backlog': this.clearChatBacklog,
    'realm.chat.add-peer': this.addPeerToChat,
    'realm.chat.remove-peer': this.removePeerFromChat,
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
    getChatPeers: async (path: string) =>
      await ipcRenderer.invoke('realm.chat.get-chat-peers', path),
    sendMessage: (path: string, fragments: any[]) =>
      ipcRenderer.invoke('realm.chat.send-message', path, fragments),
    editMessage: (path: string, msgId: string, fragments: any[]) =>
      ipcRenderer.invoke('realm.chat.edit-message', path, msgId, fragments),
    deleteMessage: (path: string, msgId: string) =>
      ipcRenderer.invoke('realm.chat.delete-message', path, msgId),
    createChat: (
      peers: string[],
      type: ChatPathType,
      metadata: ChatPathMetadata
    ) => ipcRenderer.invoke('realm.chat.create-chat', peers, type, metadata),
    editChat: (
      path: string,
      metadata: ChatPathMetadata,
      peersGetBacklog: boolean
    ) =>
      ipcRenderer.invoke(
        'realm.chat.edit-chat',
        path,
        metadata,
        peersGetBacklog
      ),
    addPeer: (path: string, peer: string) =>
      ipcRenderer.invoke('realm.chat.add-peer', path, peer),
    removePeer: (path: string, peer: string) =>
      ipcRenderer.invoke('realm.chat.remove-peer', path, peer),
    fetchPinnedChats: () => ipcRenderer.invoke('realm.chat.fetch-pinned-chats'),
    togglePinnedChat: (path: string, pinned: boolean) =>
      ipcRenderer.invoke('realm.chat.toggle-pinned-chat', path, pinned),
    setPinnedMessage: (path: string, msgId: string) =>
      ipcRenderer.invoke('realm.chat.set-pinned-message', path, msgId),
    clearPinnedMessage: (path: string) =>
      ipcRenderer.invoke('realm.chat.clear-pinned-message', path),
    clearChatBacklog: (path: string) =>
      ipcRenderer.invoke('realm.chat.clear-chat-backlog', path),
    // readChat: (path: string) =>
    //   ipcRenderer.invoke('realm.chat.read-chat', path),
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
    this.deletePathsRow = this.deletePathsRow.bind(this);
    this.deleteMessagesRow = this.deleteMessagesRow.bind(this);
    this.deletePeersRow = this.deletePeersRow.bind(this);
    this.applyDeleteLogs = this.applyDeleteLogs.bind(this);
    this.insertDeleteLogs = this.insertDeleteLogs.bind(this);

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
    await this.core.conduit!.watch({
      app: 'chat-db',
      path: '/db',
      onEvent: this.onDbUpdate,
      onQuit: this.onQuit,
      onError: this.onError,
    });
    const paths = await this.fetchPaths();
    const peers = await this.fetchPeers();
    const messages = await this.fetchMessages();
    const deleteLogs = await this.fetchDeleteLogs();
    this.insertMessages(messages);
    this.insertPaths(paths);
    this.insertPeers(peers);
    // Missed delete events must be applied after inserts
    this.applyDeleteLogs(deleteLogs).then(() => {
      // and after applying successfully, insert them into the db
      this.insertDeleteLogs(deleteLogs);
    });
  }

  async fetchMessages() {
    const lastTimestamp = this.getLastTimestamp('messages');
    const response = await this.core.conduit!.scry({
      app: 'chat-db',
      path: `/db/messages/start-ms/${lastTimestamp}`,
    });
    return response.tables.messages;
  }

  async fetchPaths() {
    const lastTimestamp = this.getLastTimestamp('paths');
    const response = await this.core.conduit!.scry({
      app: 'chat-db',
      path: `/db/paths/start-ms/${lastTimestamp}`,
    });
    return response.tables.paths;
  }

  async fetchPeers() {
    const lastTimestamp = this.getLastTimestamp('peers');
    const response = await this.core.conduit!.scry({
      app: 'chat-db',
      path: `/db/peers/start-ms/${lastTimestamp}`,
    });
    return response.tables.peers;
  }

  async fetchDeleteLogs() {
    const lastTimestamp = this.getLastTimestamp('delete_logs');
    const response = await this.core.conduit!.scry({
      app: 'chat-db',
      path: `/delete-log/start-ms/${lastTimestamp}`,
    });
    return response;
  }

  onDbUpdate(data: ChatDbReactions, _id?: number) {
    if ('tables' in data) {
      console.log('db update', data.tables.messages);
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
          console.log('add-row to messages', addRow.row);
          const message = addRow.row as MessagesRow;
          this.insertMessages([message]);
          const msg = this.getChatMessage(message['msg-id']);
          this.sendChatUpdate('message-received', msg);
          break;
        case 'paths':
          console.log('add-row to paths', addRow.row);
          const path = addRow.row as PathsRow;
          this.insertPaths([path]);
          const chat = this.getChat(path.path);
          this.sendChatUpdate('path-added', chat);

          break;
        case 'peers':
          console.log('add-row to peers', addRow.row);
          const peers = [addRow.row] as PeersRow[];
          this.insertPeers(peers);
          break;
      }
    }
    if (dbChange.type === 'update') {
      const update = dbChange as UpdateRow;
      switch (update.table) {
        case 'messages':
          const message = update as UpdateMessage;
          console.log('update messages', message.message);
          const msgId = message.message[0]['msg-id'];
          this.insertMessages(message.message);
          const msg = this.getChatMessage(msgId);
          this.sendChatUpdate('message-edited', msg);
          break;
        case 'paths':
          console.log('update paths', update.row);
          const path = update.row as PathsRow;
          this.insertPaths([path]);
          // this.sendChatUpdate('path-updated', path.path);
          break;
        case 'peers':
          console.log('update peers', update.row);
          const peers = update.row as PeersRow;
          this.insertPeers([peers]);
          break;
      }
    }
    if (
      dbChange.type === 'del-messages-row' ||
      dbChange.type === 'del-paths-row' ||
      dbChange.type === 'del-peers-row'
    ) {
      this.handleDeletes(dbChange);
    }
  }

  handleDeletes(dbChange: DelMessagesRow | DelPathsRow | DelPeersRow) {
    if (dbChange.type === 'del-messages-row') {
      console.log('del-messages-row', dbChange);
      const delMessagesRow = dbChange as DelMessagesRow;
      this.deleteMessagesRow(delMessagesRow['msg-id']);
      this.sendChatUpdate('message-deleted', delMessagesRow['msg-id']);
    }
    if (dbChange.type === 'del-paths-row') {
      console.log('del-paths-row', dbChange);
      const delPathsRow = dbChange as DelPathsRow;
      this.deletePathsRow(delPathsRow.row);
      this.sendChatUpdate('path-deleted', delPathsRow.row);
    }
    if (dbChange.type === 'del-peers-row') {
      console.log('del-peers-row', dbChange);
      const delPeersRow = dbChange as DelPeersRow;
      this.deletePeersRow(delPeersRow.path, delPeersRow.ship);
      this.sendChatUpdate('peer-deleted', delPeersRow);
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
      `REPLACE INTO messages (
        path, 
        msg_id, 
        msg_part_id, 
        content_type, 
        content_data, 
        reply_to, 
        metadata, 
        sender,
        created_at, 
        updated_at,
        expires_at
      ) VALUES (
        @path, 
        @msg_id, 
        @msg_part_id,
        @content_type,
        @content_data,
        @reply_to,
        @metadata,
        @sender,
        @created_at,
        @updated_at,
        @expires_at
      )`
    );
    const insertMany = this.db.transaction((messages) => {
      for (const message of messages) {
        insert.run({
          path: message.path,
          msg_id: message['msg-id'],
          msg_part_id: message['msg-part-id'],
          content_type: message['content-type'],
          content_data: message['content-data'],
          reply_to: message['reply-to'],
          metadata: JSON.stringify(message.metadata),
          sender: message.sender,
          created_at: message['created-at'],
          updated_at: message['updated-at'],
          expires_at: message['expires-at'],
        });
      }
    });
    insertMany(messages);
  }

  insertPaths(paths: PathsRow[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO paths (
          path, 
          type, 
          metadata, 
          peers_get_backlog,
          pins,
          max_expires_at_duration,
          created_at, 
          updated_at
        ) VALUES (@path, @type, @metadata, @peers_get_backlog, @pins, @max_expires_at_duration, @created_at, @updated_at)`
    );
    const insertMany = this.db.transaction((paths) => {
      console.log(paths);
      for (const path of paths)
        insert.run({
          path: path.path,
          type: path.type,
          metadata: JSON.stringify(path.metadata),
          peers_get_backlog: path['peers-get-backlog'] === true ? 1 : 0,
          pins: JSON.stringify(path['pins']),
          max_expires_at_duration: path['max-expires-at-duration'] ?? null,
          created_at: path['created-at'],
          updated_at: path['updated-at'],
        });
    });
    insertMany(paths);
  }

  insertPeers(peers: PeersRow[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO peers (
          path, 
          ship, 
          role,
          created_at, 
          updated_at
        ) VALUES (@path, @ship, @role, @created_at, @updated_at)`
    );
    const insertMany = this.db.transaction((peers) => {
      for (const peer of peers)
        insert.run({
          path: peer.path,
          ship: peer.ship,
          role: peer.role,
          created_at: peer['created-at'],
          updated_at: peer['updated-at'],
        });
    });
    insertMany(peers);
  }

  async applyDeleteLogs(deleteLogs: DeleteLogRow[]) {
    deleteLogs.forEach((deleteLog) => {
      this.handleDeletes(deleteLog.change);
    });
  }

  insertDeleteLogs(deleteLogs: DeleteLogRow[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO delete_logs (
          change, 
          timestamp
        ) VALUES (@change, @timestamp)`
    );
    const insertMany = this.db.transaction((deleteLogs) => {
      for (const deleteLog of deleteLogs)
        insert.run({
          change: JSON.stringify(deleteLog.change),
          timestamp: deleteLog.timestamp,
        });
    });
    insertMany(deleteLogs);
  }

  deletePathsRow(path: string) {
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

  deletePeersRow(path: string, peer: string) {
    if (!this.db) throw new Error('No db connection');
    const deletePath = this.db.prepare(
      'DELETE FROM peers WHERE path = ? AND ship = ?'
    );
    console.log(`deleting peer ${peer} on ${path}`);
    deletePath.run(path, peer);
  }

  deleteMessagesRow(msgId: string) {
    if (!this.db) throw new Error('No db connection');
    const deleteMessage = this.db.prepare(
      'DELETE FROM messages WHERE msg_id = ?'
    );
    console.log('deleting msgId', msgId);
    deleteMessage.run(msgId);
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
                ORDER BY msg_part_id, created_at DESC
            )
            SELECT
                realm_chat.path,
                realm_chat.msg_id,
                realm_chat.msg_part_id,
                json_object(realm_chat.content_type, realm_chat.content_data) content,
                realm_chat.sender,
                realm_chat.created_at,
                realm_chat.updated_at,
                realm_chat.reply_to,
                realm_chat.metadata
            FROM realm_chat
            ORDER BY
                realm_chat.created_at DESC,
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
            MAX(created_at) m_created_at,
            MAX(updated_at) m_updated_at
        FROM formed_fragments
        GROUP BY msg_id
        ORDER BY m_created_at DESC,
                msg_id DESC,
                msg_part_id DESC
      ), chat_with_messages AS (
        SELECT
            path,
            contents lastMessage,
            sender lastSender,
            m_created_at created_at,
            m_updated_at updated_at
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
        json_extract(metadata, '$.creator') AS host,
        paths.peers_get_backlog peersGetBacklog,
        json_extract(pins, '$[0]') pinnedMessageId,
        lastMessage,
        lastSender,
        chat_with_messages.created_at createdAt,
        chat_with_messages.updated_at updatedAt,
        paths.max_expires_at_duration expiresDuration
      FROM paths
      LEFT JOIN chat_with_messages ON paths.path = chat_with_messages.path
      WHERE paths.path LIKE '%realm-chat%'
      ORDER BY
          chat_with_messages.created_at DESC,
          json_extract(json(metadata), '$.timestamp') DESC;
    `);
    const result = query.all(`~${this.core.conduit?.ship}`);

    return result.map((row) => {
      return {
        ...row,
        peersGetBacklog: row.peersGetBacklog === 1 ? true : false,
        peers: row.peers ? JSON.parse(row.peers) : [],
        metadata: row.metadata ? parseMetadata(row.metadata) : null,
        lastMessage: row.lastMessage
          ? JSON.parse(row.lastMessage).map(
              (message: any) => message && JSON.parse(message)
            )
          : null,
      };
    });
  }

  getChat(path: string) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      WITH formed_messages AS (
        WITH formed_fragments AS (
            WITH realm_chat as (
                SELECT *
                FROM messages
                WHERE path LIKE '%realm-chat%'
                ORDER BY msg_part_id, created_at DESC
            )
            SELECT
                realm_chat.path,
                realm_chat.msg_id,
                realm_chat.msg_part_id,
                json_object(realm_chat.content_type, realm_chat.content_data) content,
                realm_chat.sender,
                realm_chat.created_at,
                realm_chat.updated_at,
                realm_chat.reply_to,
                realm_chat.metadata
            FROM realm_chat
            ORDER BY
                realm_chat.created_at DESC,
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
            MAX(created_at) m_created_at,
            MAX(updated_at) m_updated_at
        FROM formed_fragments
        GROUP BY msg_id
        ORDER BY m_created_at DESC,
                msg_id DESC,
                msg_part_id DESC
      ), chat_with_messages AS (
        SELECT
            path,
            contents lastMessage,
            sender lastSender,
            m_created_at created_at,
            m_updated_at updated_at
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
        json_extract(metadata, '$.creator') AS host,
        paths.peers_get_backlog peersGetBacklog,
        json_extract(json_extract(pins, '$[0]'), '$[0]') ||
        json_extract(json_extract(pins, '$[0]'), '$[1]') pinnedMessageId,
        lastMessage,
        lastSender,
        chat_with_messages.created_at createdAt,
        chat_with_messages.updated_at updatedAt,
        paths.max_expires_at_duration expiresDuration
      FROM paths
      LEFT JOIN chat_with_messages ON paths.path = chat_with_messages.path
      WHERE paths.path = ?
      ORDER BY
          chat_with_messages.created_at DESC,
          json_extract(json(metadata), '$.timestamp') DESC;
    `);
    const result = query.all(`~${this.core.conduit?.ship}`, path);

    const rows = result.map((row) => {
      return {
        ...row,
        peersGetBacklog: row.peersGetBacklog === 1 ? true : false,
        peers: row.peers ? JSON.parse(row.peers) : [],
        metadata: row.metadata ? parseMetadata(row.metadata) : null,
        lastMessage: row.lastMessage
          ? JSON.parse(row.lastMessage).map(
              (message: any) => message && JSON.parse(message)
            )
          : null,
      };
    });
    if (rows.length === 0) return null;
    return rows[0];
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
            ORDER BY msg_part_id, created_at DESC
        )
        SELECT
            realm_chat.path,
            realm_chat.msg_id,
            realm_chat.msg_part_id,
            json_object(realm_chat.content_type, realm_chat.content_data) content,
            realm_chat.sender,
            realm_chat.created_at,
            realm_chat.updated_at,
            realm_chat.reply_to,
            realm_chat.metadata
        FROM realm_chat
        ORDER BY
            realm_chat.created_at DESC,
            realm_chat.msg_id DESC,
            realm_chat.msg_part_id
      )
      SELECT
        path,
        msg_id id,
        json_group_array(json_extract(content, '$')) as contents,
        sender,
        reply_to,
        metadata,
        MAX(formed_fragments.created_at) createdAt,
        MAX(formed_fragments.updated_at) updatedAt
      FROM formed_fragments
      GROUP BY msg_id
      ORDER BY createdAt;
    `);
    const result = query.all(path);
    return result.map((row) => {
      return {
        ...row,
        metadata: row.metadata ? parseMetadata(row.metadata) : [null],
        contents: row.contents ? JSON.parse(row.contents) : null,
      };
    });
  }

  getChatMessage(msgId: string) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT
        path,
        msg_id id,
        json_group_array(json_object(content_type, content_data)) contents,
        sender,
        MAX(created_at) as createdAt,
        MAX(updated_at) as updatedAt
      FROM (SELECT path,
                  msg_id,
                  content_type,
                  content_data,
                  sender,
                  created_at,
                  updated_at
            FROM messages
            WHERE msg_id = ?
            ORDER BY msg_id, msg_part_id)
      GROUP BY msg_id
      ORDER BY created_at;
    `);
    const result = query.all(path, msgId);
    const rows = result.map((row) => {
      return {
        ...row,
        contents: JSON.parse(row.contents),
      };
    });
    if (rows.length === 0) return null;
    return rows[0];
  }

  getLastTimestamp(
    table: 'paths' | 'messages' | 'peers' | 'delete_logs'
  ): number {
    if (!this.db) throw new Error('No db connection');
    const column = table === 'delete_logs' ? 'timestamp' : 'updated_at';
    const query = this.db.prepare(`
      SELECT max(${column}) as lastTimestamp
      FROM ${table};
    `);
    const result = query.all();
    // add 1 to avoid getting same timestamp again
    return result[0].lastTimestamp + 1 || 0;
  }

  getChatPeers(_evt: any, path: string) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT ship AS peer, role
      FROM peers
      WHERE path = ?;
    `);
    const result = query.all(path);
    return result;
  }

  // ------------------------------
  // ---------- Actions -----------
  // ------------------------------

  async sendMessage(_evt: any, path: string, fragments: any[]) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'send-message': {
          path: path,
          fragments,
          'expires-in': null,
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

  async setPinnedMessage(_evt: any, path: string, msgId: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'pin-message': {
          'msg-id': msgId,
          path: path,
          pin: true,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to pin chat');
    }
  }

  async clearPinnedMessage(_evt: any, path: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'clear-pinned-messages': {
          path: path,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to unpin chat');
    }
  }

  async editMessage(_evt: any, path: string, msgId: string, fragments: any[]) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'edit-message': {
          'msg-id': msgId,
          path,
          fragments,
        },
      },
    };
    console.log(payload);
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to edit message');
    }
  }

  async deleteMessage(_evt: any, path: string, msgId: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'delete-message': {
          'msg-id': msgId,
          path,
        },
      },
    };
    console.log(payload);
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to delete message');
    }
  }

  async clearChatBacklog(_evnt: any, path: string) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      json: {
        'delete-backlog': {
          path,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to delete chat backlog');
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
          invites: 'anyone',
          'max-expires-at-duration': null,
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

  // readChat(path: string) {
  //   if (!this.core.conduit) throw new Error('No conduit connection');
  //   // this.core.conduit.readChat(path);
  // }

  async fetchPinnedChats() {
    const response = await this.core.conduit!.scry({
      app: 'realm-chat',
      path: '/pins',
    });
    return response;
  }

  async togglePinnedChat(_evt: any, path: string, pinned: boolean) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      reaction: '',
      json: {
        'pin-chat': {
          path,
          pin: pinned,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to pin chat');
    }
  }

  async editChatMetadata(
    _evt: any,
    path: string,
    metadata: ChatPathMetadata,
    peersGetBacklog: boolean
  ) {
    if (!this.core.conduit) throw new Error('No conduit connection');
    const payload = {
      app: 'realm-chat',
      mark: 'action',
      reaction: '',
      json: {
        'edit-chat': {
          path,
          metadata,
          'peers-get-backlog': peersGetBacklog,
        },
      },
    };
    try {
      await this.core.conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to edit chat');
    }
  }

  async addPeerToChat(_evt: any, path: string, ship: string) {
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

  async removePeerFromChat(_evt: any, path: string, ship: string) {
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
      throw new Error('Failed to leave chat');
    }
  }
}
