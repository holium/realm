import { Database } from 'better-sqlite3';
import { BrowserWindow } from 'electron';
import AbstractDataAccess from '../../abstract.db';
import { APIConnection } from '../../conduit';

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
  | 'path-updated'
  | 'path-deleted'
  | 'peer-added'
  | 'peer-deleted';

interface ChatRow {
  id: number;
  app: string;
  path: string;
  type: string;
  title: string;
  content: string;
  image: string;
  buttons: any;
  link: string;
  metadata: any;
  createdAt: number;
  updatedAt: number;
  readAt: number | null;
  read: boolean;
  dismissedAt: number | null;
  dismissed: boolean;
}

export class ChatDAO extends AbstractDataAccess<ChatRow> {
  constructor(db: Database) {
    super(db, 'paths');
    this.onQuit = this.onQuit.bind(this);
    this.onError = this.onError.bind(this);
    this.onDbUpdate = this.onDbUpdate.bind(this);
    this.init = this.init.bind(this);
    APIConnection.getInstance().conduit.watch({
      app: 'chat-db',
      path: '/db',
      onEvent: this.onDbUpdate,
      onQuit: this.onQuit,
      onError: this.onError,
    });
    this.init();
  }

  async init() {
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

  protected mapRow(row: any): ChatRow {
    return {
      id: row.id,
      app: row.app,
      path: row.path,
      type: row.type,
      title: row.title,
      content: row.content,
      image: row.image,
      buttons: row.buttons ? JSON.parse(row.buttons) : null,
      link: row.link,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: row['created-at'],
      updatedAt: row['updated-at'],
      readAt: row['read-at'],
      read: row.read === 1,
      dismissedAt: row['dismissed-at'],
      dismissed: row.dismissed === 1,
    };
  }
  //
  // Fetches
  //
  async fetchMuted() {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'realm-chat',
      path: '/mutes',
    });
    return response;
  }

  async fetchPinnedChats() {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'realm-chat',
      path: '/pins',
    });
    return response;
  }

  async fetchMessages() {
    const lastTimestamp = this.getLastTimestamp('messages');
    try {
      const response = await APIConnection.getInstance().conduit.scry({
        app: 'chat-db',
        path: `/db/messages/start-ms/${lastTimestamp}`,
      });
      return response.tables.messages;
    } catch (e) {
      return [];
    }
  }

  async fetchPaths() {
    const lastTimestamp = this.getLastTimestamp('paths');
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/db/paths/start-ms/${lastTimestamp}`,
    });
    return response.tables.paths;
  }

  async fetchPeers() {
    const lastTimestamp = this.getLastTimestamp('peers');
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/db/peers/start-ms/${lastTimestamp}`,
    });
    return response.tables.peers;
  }

  async fetchDeleteLogs() {
    const lastTimestamp = this.getLastTimestamp('delete_logs');
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/delete-log/start-ms/${lastTimestamp}`,
    });
    return response;
  }
  onDbUpdate(data: ChatDbReactions, _id?: number) {
    if ('tables' in data) {
      this.insertMessages(data.tables.messages);
      this.insertPaths(data.tables.paths);
      this.insertPeers(data.tables.peers);
    } else if (Array.isArray(data)) {
      if (
        data.length > 1 &&
        data[0].type === 'add-row' &&
        data[0].table === 'messages'
      ) {
        // insert multi fragment messages
        // TODO find a way to handle multiple msg-ids in one db update
        // if it is even possible
        const messages = data.map(
          (row) => (row as AddRow).row as MessagesRow
        ) as MessagesRow[];
        this.insertMessages(messages);
        const msg = this.getChatMessage(messages[0]['msg-id']);
        this.sendChatUpdate('message-received', msg);
      } else {
        data.forEach(this.handleDBChange);
      }
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
          const msg = this.getChatMessage(message['msg-id']);
          this.sendChatUpdate('message-received', msg);
          break;
        case 'paths':
          // console.log('add-row to paths', addRow.row);
          const path = addRow.row as PathsRow;
          this.insertPaths([path]);
          const chat = this.getChat(path.path);
          this.sendChatUpdate('path-added', chat);

          break;
        case 'peers':
          // console.log('add-row to peers', addRow.row);
          const peers = addRow.row as PeersRow;
          this.insertPeers([peers]);
          this.sendChatUpdate('peer-added', peers);
          break;
      }
    }
    if (dbChange.type === 'update') {
      const update = dbChange as UpdateRow;
      switch (update.table) {
        case 'messages':
          const message = update as UpdateMessage;
          // console.log('update messages', message.message);
          const msgId = message.message[0]['msg-id'];
          this.insertMessages(message.message);
          const msg = this.getChatMessage(msgId);
          this.sendChatUpdate('message-edited', msg);
          break;
        case 'paths':
          // console.log('update paths', update.row);
          const path = update.row as PathsRow;
          this.insertPaths([path]);
          const chat = this.getChat(path.path);
          this.sendChatUpdate('path-updated', chat);
          break;
        case 'peers':
          // console.log('update peers', update.row);
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
    // insert into delete_logs
    if (dbChange.type === 'del-messages-row') {
      // console.log('del-messages-row', dbChange);
      const delMessagesRow = dbChange as DelMessagesRow;
      this.deleteMessagesRow(delMessagesRow['msg-id']);
      this.sendChatUpdate('message-deleted', delMessagesRow);
      this.insertDeleteLogs([
        {
          change: delMessagesRow,
          timestamp: delMessagesRow.timestamp,
        },
      ]);
    }
    if (dbChange.type === 'del-paths-row') {
      // console.log('del-paths-row', dbChange);
      const delPathsRow = dbChange as DelPathsRow;
      this.deletePathsRow(delPathsRow.row);
      this.sendChatUpdate('path-deleted', delPathsRow.row);
      this.insertDeleteLogs([
        {
          change: delPathsRow,
          timestamp: delPathsRow.timestamp,
        },
      ]);
    }
    if (dbChange.type === 'del-peers-row') {
      // console.log('del-peers-row', dbChange);
      const delPeersRow = dbChange as DelPeersRow;
      this.deletePeersRow(delPeersRow.row, delPeersRow.ship);
      this.sendChatUpdate('peer-deleted', delPeersRow);
      this.insertDeleteLogs([
        {
          change: delPeersRow,
          timestamp: delPeersRow.timestamp,
        },
      ]);
    }
  }

  sendChatUpdate(type: ChatUpdateType, data: any) {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('realm.chat.on-db-change', type, data);
  }

  onQuit() {
    console.log('fail!');
  }
  onError(err: any) {
    console.log('err!', err);
  }
  parseMetadata = (metadata: string) => {
    const mtd = JSON.parse(metadata);
    return {
      ...mtd,
      timestamp: parseInt(mtd.timestamp) || 0,
      reactions: mtd.reactions === 'true',
    };
  };
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
                WHERE path LIKE '%realm-chat%' AND content_type != 'react' AND content_type != 'status'
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
            json_object('id', msg_id, 'contents', contents, 'createdAt', m_created_at) lastMessage,
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
            SELECT json_group_array(json_object('ship', ship, 'role', role))
            FROM peers
            WHERE peers.path = paths.path
        ) AS peers,
        json_extract(metadata, '$.creator') AS host,
        paths.peers_get_backlog peersGetBacklog,
        json_extract(pins, '$[0]') pinnedMessageId,
        lastMessage,
        lastSender,
        chat_with_messages.created_at createdAt,
        chat_with_messages.updated_at updatedAt,
        paths.max_expires_at_duration expiresDuration,
        paths.invites
      FROM paths
      LEFT JOIN chat_with_messages ON paths.path = chat_with_messages.path
      WHERE paths.path LIKE '%realm-chat%'
      ORDER BY
          chat_with_messages.created_at DESC,
          json_extract(json(metadata), '$.timestamp') DESC;
    `);
    const result = query.all();

    return result.map((row) => {
      // deserialize the last message
      const lastMessage = row.lastMessage ? JSON.parse(row.lastMessage) : null;
      if (lastMessage && lastMessage.contents) {
        lastMessage.contents = JSON.parse(lastMessage.contents).map(
          (message: any) => message && JSON.parse(message)
        );
      }
      return {
        ...row,
        peersGetBacklog: row.peersGetBacklog === 1,
        peers: row.peers ? JSON.parse(row.peers) : [],
        metadata: row.metadata ? this.parseMetadata(row.metadata) : null,
        lastMessage,
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
                WHERE path LIKE '%realm-chat%' AND content_type != 'react' AND content_type != 'status'
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
            json_object('id', msg_id, 'contents', contents, 'createdAt', m_created_at) lastMessage,
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
            SELECT json_group_array(json_object('ship', ship, 'role', role))
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
        paths.max_expires_at_duration expiresDuration,
        paths.invites
      FROM paths
      LEFT JOIN chat_with_messages ON paths.path = chat_with_messages.path
      WHERE paths.path = ?
      ORDER BY
          chat_with_messages.created_at DESC,
          json_extract(json(metadata), '$.timestamp') DESC;
    `);
    const result = query.all(
      `~${APIConnection.getInstance().conduit.ship}`,
      path
    );

    const rows = result.map((row) => {
      const lastMessage = row.lastMessage ? JSON.parse(row.lastMessage) : null;
      if (lastMessage && lastMessage.contents) {
        lastMessage.contents = JSON.parse(lastMessage.contents).map(
          (message: any) => message && JSON.parse(message)
        );
      }
      return {
        ...row,
        peersGetBacklog: row.peersGetBacklog === 1,
        peers: row.peers ? JSON.parse(row.peers) : [],
        metadata: row.metadata ? this.parseMetadata(row.metadata) : null,
        lastMessage,
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
            WHERE path = ? AND content_type != 'react'
            ORDER BY msg_part_id, created_at DESC
        )
        SELECT
            realm_chat.path,
            realm_chat.msg_id,
            realm_chat.msg_part_id,
            json_object(realm_chat.content_type, realm_chat.content_data, 'metadata', realm_chat.metadata) content,
            realm_chat.sender,
            realm_chat.created_at,
            realm_chat.updated_at,
            realm_chat.expires_at,
            realm_chat.reply_to,
            realm_chat.metadata
        FROM realm_chat
        ORDER BY
            realm_chat.created_at DESC,
            realm_chat.msg_id DESC,
            realm_chat.msg_part_id
        ),
        reactions AS (
            SELECT
              json_extract(messages.reply_to, '$."msg-id"') reply_msg_id,
              json_group_array(
                  json_object(
                      'msgId', messages.msg_id,
                      'by', messages.sender,
                      'emoji', messages.content_data
                      )
              ) reacts
            FROM messages
            WHERE content_type = 'react'
            GROUP BY reply_msg_id
        )
        SELECT
          formed_fragments.path,
          formed_fragments.msg_id id,
          json_group_array(json_extract(content, '$')) as contents,
          formed_fragments.sender,
          json_extract(formed_fragments.reply_to, '$."path"') replyToMsgPath,
          json_extract(formed_fragments.reply_to, '$."msg-id"') replyToMsgId,
          formed_fragments.metadata,
          CASE
              WHEN reactions.reacts IS NOT NULL THEN reacts
              WHEN reactions.reacts IS NULL THEN NULL
          END reactions,
          MAX(formed_fragments.created_at) createdAt,
          MAX(formed_fragments.updated_at) updatedAt,
          MAX(formed_fragments.expires_at) expiresAt
        FROM formed_fragments
        LEFT OUTER JOIN reactions ON reactions.reply_msg_id = formed_fragments.msg_id
        GROUP BY formed_fragments.msg_id
        ORDER BY createdAt;
    `);
    const result = query.all(path);
    return result.map((row) => {
      return {
        ...row,
        metadata: row.metadata ? this.parseMetadata(row.metadata) : [null],
        contents: row.contents
          ? JSON.parse(row.contents).map((content: any) => {
              if (content?.metadata) {
                content.metadata = JSON.parse(content.metadata);
              }
              return content;
            })
          : null,
        reactions: row.reactions ? JSON.parse(row.reactions) : [],
      };
    });
  }

  getReplyToMessage(_evt: any, replyId: string) {
    return this.getChatMessage(replyId);
  }

  getChatMessage(msgId: string) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT
        path,
        msg_id id,
        json_group_array(json_object(content_type, content_data, 'metadata', metadata)) contents,
        sender,
        json_extract(reply_to, '$."path"') replyToMsgPath,
        json_extract(reply_to, '$."msg-id"') replyToMsgId,
        MAX(created_at) as createdAt,
        MAX(updated_at) as updatedAt,
        MAX(expires_at) as expiresAt
      FROM (SELECT path,
                  msg_id,
                  content_type,
                  content_data,
                  metadata,
                  reply_to,
                  sender,
                  created_at,
                  updated_at,
                  expires_at
            FROM messages
            WHERE msg_id = ?
            ORDER BY msg_id, msg_part_id)
      GROUP BY msg_id
      ORDER BY created_at;
    `);
    const result = query.all(msgId);
    const rows = result.map((row) => {
      return {
        ...row,
        contents: row.contents
          ? JSON.parse(row.contents).map((content: any) => {
              const parsedContent = content;
              if (parsedContent?.metadata) {
                parsedContent.metadata = JSON.parse(content.metadata);
              }
              return parsedContent;
            })
          : null,
      };
    });
    if (rows.length === 0) return null;
    return rows[0];
  }

  getLastTimestamp(
    table: 'paths' | 'messages' | 'peers' | 'delete_logs' | 'notifications'
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
      SELECT ship, role
      FROM peers
      WHERE path = ?;
    `);
    const result = query.all(path);
    return result;
  }

  //
  // Inserts
  //

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
          reply_to: JSON.stringify(message['reply-to']),
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
          invites,
          created_at, 
          updated_at
        ) VALUES (@path, @type, @metadata, @peers_get_backlog, @pins, @max_expires_at_duration, @invites, @created_at, @updated_at)`
    );
    const insertMany = this.db.transaction((paths) => {
      for (const path of paths)
        insert.run({
          path: path.path,
          type: path.type,
          metadata: JSON.stringify(path.metadata),
          peers_get_backlog: path['peers-get-backlog'] === true ? 1 : 0,
          pins: JSON.stringify(path['pins']),
          invites: path.invites,
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
    // insert into delete logs
  }
}

export const chatInitSql = `
create table if not exists messages
(
    path         TEXT    not null,
    msg_id       TEXT    not null,
    msg_part_id  integer not null,
    content_type TEXT,
    content_data TEXT,
    reply_to     TEXT,
    metadata     text,
    sender       text    not null,
    updated_at   integer not null,
    created_at   integer not null,
    expires_at   integer
);

create unique index if not exists messages_path_msg_id_msg_part_id_uindex
    on messages (path, msg_id, msg_part_id);

create table if not exists paths
(
    path                        TEXT not null,
    type                        TEXT not null,
    metadata                    TEXT,
    invites                     TEXT default 'host' not null,
    peers_get_backlog           integer default 1 not null,
    pins                        TEXT,
    max_expires_at_duration     integer,
    updated_at                  integer not null,
    created_at                  integer not null
);

create unique index if not exists paths_path_uindex
    on paths (path);

create table if not exists  peers
(
    path        TEXT not null,
    ship        text not null,
    role        TEXT default 'member' not null,
    updated_at  integer not null,
    created_at  integer not null
);

create unique index if not exists peers_path_ship_uindex
    on peers (path, ship);

create table if not exists delete_logs
(
    change        TEXT not null,
    timestamp  integer not null
);

create unique index if not exists delete_log_change_uindex
    on delete_logs (timestamp, change);
`;
