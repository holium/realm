import log from 'electron-log';
import { preSig } from '@urbit/aura';

import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../abstract.db';
import { APIConnection } from '../../api';
import { CHAT_TABLES } from './chat.schema';
import {
  AddRow,
  ChatDbOps,
  ChatDbReactions,
  ChatUpdateTypes,
  DeleteLogRow,
  DelMessagesRow,
  DelPathsRow,
  DelPeersRow,
  MessagesRow,
  PathsRow,
  PeersRow,
  UpdateMessage,
  // DelPeersRow,
  UpdateRow,
} from './chat.types';

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

export class ChatDB extends AbstractDataAccess<ChatRow, ChatUpdateTypes> {
  constructor(params: DataAccessContructorParams) {
    params.name = 'chatDB';
    super(params);
    if (params.preload) return;
    this._onError = this._onError.bind(this);
    this._onDbUpdate = this._onDbUpdate.bind(this);
    this._handleDBChange = this._handleDBChange.bind(this);
    this.init = this.init.bind(this);
  }

  async init() {
    const paths = await this._fetchPaths();
    const peers = await this._fetchPeers();
    const messages = await this._fetchMessages();
    const deleteLogs = await this._fetchDeleteLogs();
    this._insertMessages(messages);
    this._insertPaths(paths);
    this._insertPeers(peers);
    // Missed delete events must be applied after inserts
    this._applyDeleteLogs(deleteLogs).then(() => {
      // and after applying successfully, insert them into the db
      this._insertDeleteLogs(deleteLogs);
    });
    APIConnection.getInstance().conduit.watch({
      app: 'chat-db',
      path: '/db',
      onEvent: this._onDbUpdate,
      onError: this._onError,
    });
    await this.fetchPathMetadata();
    this.sendUpdate({ type: 'init', payload: this.getChatList() });
    return;
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
  async fetchMessageCountForPath(path: string) {
    if (!this.db?.open || path.length === 0) return;
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/db/message-count-for-path${path}`,
    });

    return response;
  }

  async fetchMuted() {
    if (!this.db?.open) return;
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'realm-chat',
      path: '/mutes',
    });

    return response;
  }

  async fetchPathMetadata() {
    try {
      if (!this.db?.open) return;
      const allPaths = this.db
        .prepare(`SELECT path FROM ${CHAT_TABLES.PATHS}`)
        .all();

      const muted = await APIConnection.getInstance().conduit.scry({
        app: 'realm-chat',
        path: '/mutes',
      });
      const pinned = await APIConnection.getInstance().conduit.scry({
        app: 'realm-chat',
        path: '/pins',
      });

      const truncate = `DELETE FROM ${CHAT_TABLES.PATHS_FLAGS};`;
      this.db.prepare(truncate).run();

      const insert = this.db.prepare(
        `REPLACE INTO ${CHAT_TABLES.PATHS_FLAGS} (
          path,
          muted,
          pinned
        ) VALUES (@path, @muted, @pinned)`
      );
      const insertMany = this.db.transaction((rows: { path: string }[]) => {
        for (const row of rows)
          insert.run({
            path: row.path,
            muted: muted.includes(row.path) ? 1 : 0,
            pinned: pinned.includes(row.path) ? 1 : 0,
          });
      });
      insertMany(allPaths);
      return { muted, pinned };
    } catch (e) {
      log.error(e);
      return { muted: [], pinned: [] };
    }
  }

  async fetchPinnedChats() {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'realm-chat',
      path: '/pins',
    });
    return response;
  }

  async resyncPathIfNeeded(path: string) {
    const msgCount: number = await this.fetchMessageCountForPath(path);
    const localMsgCount: number = this.selectMessageCountForPath(path);
    if (msgCount > localMsgCount) {
      console.log('count mismatch, we need to resync', path);
      let messages;
      try {
        const response = await APIConnection.getInstance().conduit.scry({
          app: 'chat-db',
          path: `/db/messages/start-ms/0/path${path}`, // from the beginning `0`
        });

        messages = response.tables.messages.filter((msg: any) => {
          return msg.path === path;
        });
      } catch (e) {
        messages = [];
      }
      this._insertMessages(messages);
    }
  }

  private async _fetchMessages() {
    const lastTimestamp = this.getLastTimestamp(CHAT_TABLES.MESSAGES);
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

  private async _fetchPaths() {
    const lastTimestamp = this.getLastTimestamp(CHAT_TABLES.PATHS);
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/db/paths/start-ms/${lastTimestamp}`,
    });
    if (!response) return [];
    return response.tables.paths;
  }

  private async _fetchPeers() {
    const lastTimestamp = this.getLastTimestamp(CHAT_TABLES.PEERS);
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/db/peers/start-ms/${lastTimestamp}`,
    });
    if (!response) return [];
    return response.tables.peers;
  }

  private async _fetchDeleteLogs() {
    const lastTimestamp = this.getLastTimestamp(CHAT_TABLES.DELETE_LOGS);
    // we have to add two because the delete log is inclusive
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/delete-log/start-ms/${lastTimestamp + 2}`,
    });
    if (!response) return [];

    return response;
  }

  private _onDbUpdate(data: ChatDbReactions, _id?: number) {
    if ('tables' in data) {
      this._insertMessages(data.tables.messages);
      this._insertPaths(data.tables.paths);
      this._insertPeers(data.tables.peers);
    } else if (Array.isArray(data)) {
      if (
        data.length > 1 &&
        data[0].type === 'add-row' &&
        data[0].table === 'messages'
      ) {
        const messages = data.map(
          (row) => (row as AddRow).row as MessagesRow
        ) as MessagesRow[];
        this._insertMessages(messages);
        const msg = this.getChatMessage(messages[0]['msg-id']);
        this.sendUpdate({ type: 'message-received', payload: msg });
        this.resyncPathIfNeeded(messages[0]['path']);
      } else {
        data.forEach(this._handleDBChange);
      }
    } else {
      console.log(data);
    }
  }

  private _handleDBChange(dbChange: ChatDbOps) {
    if (dbChange.type === 'add-row') {
      const addRow = dbChange as AddRow;
      switch (addRow.table) {
        case 'messages': {
          // console.log('add-row to messages', addRow.row);
          const message = addRow.row as MessagesRow;
          this._insertMessages([message]);
          const msg = this.getChatMessage(message['msg-id']);
          this.sendUpdate({ type: 'message-received', payload: msg });
          this.resyncPathIfNeeded(message['path']);
          break;
        }
        case 'paths': {
          // console.log('add-row to paths', addRow.row);
          const path = addRow.row as PathsRow;
          this._insertPaths([path]);
          const chat = this.getChat(path.path);
          this.sendUpdate({ type: 'path-added', payload: chat });

          break;
        }
        case 'peers': {
          // console.log('add-row to peers', addRow.row);
          const peers = addRow.row as PeersRow;
          this._insertPeers([peers]);
          this.sendUpdate({ type: 'peer-added', payload: peers });
          break;
        }
      }
    }
    if (dbChange.type === 'update') {
      const update = dbChange as UpdateRow;
      switch (update.table) {
        case 'messages': {
          const message = update as UpdateMessage;
          // console.log('update messages', message.message);
          const msgId = message.message[0]['msg-id'];
          this._deleteMessagesRow(msgId);
          this._insertMessages(message.message);
          const msg = this.getChatMessage(msgId);
          this.sendUpdate({ type: 'message-edited', payload: msg });
          break;
        }
        case 'paths': {
          // console.log('update paths', update.row);
          const path = update.row as PathsRow;
          this._insertPaths([path]);
          const chat = this.getChat(path.path);
          this.sendUpdate({ type: 'path-updated', payload: chat });
          break;
        }
        case 'peers': {
          // console.log('update peers', update.row);
          const peers = update.row as PeersRow;
          this._insertPeers([peers]);
          break;
        }
      }
    }
    if (
      dbChange.type === 'del-messages-row' ||
      dbChange.type === 'del-paths-row' ||
      dbChange.type === 'del-peers-row'
    ) {
      this._handleDeletes(dbChange);
    }
  }

  private _handleDeletes(dbChange: DelMessagesRow | DelPathsRow | DelPeersRow) {
    if (dbChange.type === 'del-messages-row') {
      // console.log('del-messages-row', dbChange);
      const delMessagesRow = dbChange as DelMessagesRow;
      // only delete the message if it has a created-at older than dbChange.timestamp (since if the message was created after the delete, the delete is invalid)
      const msg = this.getChatMessage(delMessagesRow['msg-id']);
      if (msg && msg.createdAt < delMessagesRow.timestamp) {
        this._deleteMessagesRow(delMessagesRow['msg-id']);
        this.sendUpdate({ type: 'message-deleted', payload: delMessagesRow });
      }
      this._insertDeleteLogs([
        {
          change: delMessagesRow,
          timestamp: delMessagesRow.timestamp,
        },
      ]);
    }
    if (dbChange.type === 'del-paths-row') {
      // console.log('del-paths-row', dbChange);
      const delPathsRow = dbChange as DelPathsRow;
      // only delete the path if our peer-row for it has a created-at older than dbChange.timestamp
      // (since if we were added to the path after the delete, the delete is invalid)
      // this can happen when someone is kicked and then re-added to a chat
      // @ts-ignore
      const peerrow = this.getChatPeer(
        delPathsRow.path,
        preSig(APIConnection.getInstance().conduit.ship)
      );
      if (peerrow && peerrow.created_at < delPathsRow.timestamp) {
        this._deletePathsRow(delPathsRow.path);
        this.sendUpdate({ type: 'path-deleted', payload: delPathsRow.path });
      }
      this._insertDeleteLogs([
        {
          change: delPathsRow,
          timestamp: delPathsRow.timestamp,
        },
      ]);
    }
    if (dbChange.type === 'del-peers-row') {
      // console.log('del-peers-row', dbChange);
      const delPeersRow = dbChange as DelPeersRow;
      // only delete the path if it has a created-at older than dbChange.timestamp (since if the path was created after the delete, the delete is invalid)
      // this can happen when someone is kicked and then re-added to a chat
      const peerrow = this.getChatPeer(delPeersRow.path, delPeersRow.ship);
      if (peerrow && peerrow.created_at < delPeersRow.timestamp) {
        this._deletePeersRow(delPeersRow.path, delPeersRow.ship);
        this.sendUpdate({ type: 'peer-deleted', payload: delPeersRow });
      }
      this._insertDeleteLogs([
        {
          change: delPeersRow,
          timestamp: delPeersRow.timestamp,
        },
      ]);
    }
  }

  private _onError(err: any) {
    console.log('err!', err);
  }
  private _parseMetadata = (metadata: string) => {
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
    if (!this.db?.open) return;
    const query = this.db.prepare(`
      WITH formed_messages AS (
        WITH formed_fragments AS (
            WITH realm_chat as (
                SELECT *
                FROM ${CHAT_TABLES.MESSAGES}
                WHERE (path LIKE '%realm-chat%' OR path LIKE '/spaces/%/chats/%') AND content_type != 'react' AND content_type != 'status'
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
        pths.path,
        type,
        metadata,
        (
            SELECT json_group_array(json_object('ship', ship, 'role', role))
            FROM ${CHAT_TABLES.PEERS} prs
            WHERE prs.path = pths.path
        ) AS peers,
        json_extract(metadata, '$.creator') AS host,
        pths.peers_get_backlog peersGetBacklog,
        json_extract(pins, '$[0]') pinnedMessageId,
        lastMessage,
        lastSender,
        pf.muted,
        pf.pinned,
        ifnull(chat_with_messages.created_at, pths.created_at) createdAt,
        ifnull(chat_with_messages.updated_at, pths.updated_at) updatedAt,
        pths.max_expires_at_duration expiresDuration,
        pths.invites
      FROM ${CHAT_TABLES.PATHS} pths
      LEFT JOIN chat_with_messages ON pths.path = chat_with_messages.path
      LEFT JOIN ${CHAT_TABLES.PATHS_FLAGS} pf on pths.path = pf.path
      WHERE pths.path LIKE '%realm-chat%' OR pths.path LIKE '/spaces/%/chats/%'
      GROUP BY pths.path
      ORDER BY
          chat_with_messages.created_at DESC,
          json_extract(json(metadata), '$.timestamp') DESC;
    `);
    const result: any = query.all();

    return result.map((row: any) => {
      // deserialize the last message
      const lastMessage = row.lastMessage ? JSON.parse(row.lastMessage) : null;
      if (lastMessage && lastMessage.contents) {
        lastMessage.contents = JSON.parse(lastMessage.contents)
          .map((message: any) => message && JSON.parse(message))
          .map(this._makeCustomContentTypeMessageFormat);
      }
      return {
        ...row,
        peersGetBacklog: row.peersGetBacklog === 1,
        peers: row.peers ? JSON.parse(row.peers) : [],
        metadata: row.metadata ? this._parseMetadata(row.metadata) : null,
        lastMessage,
        pinned: row.pinned === 1,
        muted: row.muted === 1,
      };
    });
  }

  private _makeCustomContentTypeMessageFormat(msg: any) {
    const key = Object.keys(msg)[0];
    const allowed = [
      'markdown',
      'plain',
      'bold',
      'italics',
      'strike',
      'bold-italics',
      'bold-strike',
      'italics-strike',
      'bold-italics-strike',
      'blockquote',
      'inline-code',
      'ship',
      'code',
      'link',
      'image',
      'ur-link',
      'react',
      'status',
      'break',
    ];
    if (allowed.includes(key)) {
      return msg;
    } else {
      return {
        custom: {
          name: key,
          value: msg[key],
        },
        metadata: msg.metadata,
        reactions: msg.reactions,
      };
    }
  }

  getChat(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(`
      WITH formed_messages AS (
        WITH formed_fragments AS (
            WITH realm_chat as (
                SELECT *
                FROM ${CHAT_TABLES.MESSAGES}
                WHERE (path LIKE '%realm-chat%' OR path LIKE '/spaces/%/chats/%') AND content_type != 'react' AND content_type != 'status'
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
        pths.path,
        type,
        metadata,
        (
            SELECT json_group_array(json_object('ship', ship, 'role', role))
            FROM ${CHAT_TABLES.PEERS} prs
            WHERE prs.path = pths.path AND ship != ?
        ) AS peers,
        json_extract(metadata, '$.creator') AS host,
        pths.peers_get_backlog peersGetBacklog,
        json_extract(pins, '$[0]') pinnedMessageId,
        lastMessage,
        lastSender,
        pf.muted,
        pf.pinned,
        ifnull(chat_with_messages.created_at, pths.created_at) createdAt,
        ifnull(chat_with_messages.updated_at, pths.updated_at) updatedAt,
        pths.max_expires_at_duration expiresDuration,
        pths.invites
      FROM ${CHAT_TABLES.PATHS} pths
      LEFT JOIN chat_with_messages ON pths.path = chat_with_messages.path
      LEFT JOIN ${CHAT_TABLES.PATHS_FLAGS} pf on pths.path = pf.path
      WHERE pths.path = ?
      GROUP BY pths.path
      ORDER BY
          chat_with_messages.created_at DESC,
          json_extract(json(metadata), '$.timestamp') DESC;
    `);
    const result: any = query.all(
      // @ts-ignore
      preSig(APIConnection.getInstance().conduit.ship),
      path
    );

    const rows = result.map((row: any) => {
      const lastMessage = row.lastMessage ? JSON.parse(row.lastMessage) : null;
      if (lastMessage && lastMessage.contents) {
        lastMessage.contents = JSON.parse(lastMessage.contents)
          .map((message: any) => message && JSON.parse(message))
          .map(this._makeCustomContentTypeMessageFormat);
      }
      return {
        ...row,
        peersGetBacklog: row.peersGetBacklog === 1,
        peers: row.peers ? JSON.parse(row.peers) : [],
        metadata: row.metadata ? this._parseMetadata(row.metadata) : null,
        pinned: row.pinned === 1,
        muted: row.muted === 1,
        lastMessage,
      };
    });
    if (rows.length === 0) return null;
    return rows[0];
  }

  getChatLog(path: string, _params?: { start: number; amount: number }) {
    if (!this.db?.open) return;
    const query = this.db.prepare(`
      WITH formed_fragments AS (
        WITH realm_chat as (
            SELECT *
            FROM ${CHAT_TABLES.MESSAGES}
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
              json_extract(msgs.reply_to, '$."msg-id"') reply_msg_id,
              json_group_array(
                  json_object(
                      'msgId', msgs.msg_id,
                      'by', msgs.sender,
                      'emoji', msgs.content_data
                      )
              ) reacts
            FROM ${CHAT_TABLES.MESSAGES} msgs
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
    const result: any = query.all(path);
    return result.map((row: any) => {
      return {
        ...row,
        metadata: row.metadata ? this._parseMetadata(row.metadata) : [null],
        contents: row.contents
          ? JSON.parse(row.contents)
              .map((content: any) => {
                if (content?.metadata) {
                  content.metadata = JSON.parse(content.metadata);
                }
                return content;
              })
              .map(this._makeCustomContentTypeMessageFormat)
          : null,
        reactions: row.reactions ? JSON.parse(row.reactions) : [],
      };
    });
  }

  getReplyToMessage(replyId: string) {
    return this.getChatMessage(replyId);
  }

  getChatMessage(msgId: string) {
    if (!this.db?.open) return;
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
            FROM ${CHAT_TABLES.MESSAGES}
            WHERE msg_id = ?
            ORDER BY msg_id, msg_part_id)
      GROUP BY msg_id
      ORDER BY created_at;
    `);
    const result: any = query.all(msgId);
    const rows = result.map((row: any) => {
      return {
        ...row,
        contents: row.contents
          ? JSON.parse(row.contents)
              .map((content: any) => {
                const parsedContent = content;
                if (parsedContent?.metadata) {
                  parsedContent.metadata = JSON.parse(content.metadata);
                }
                return parsedContent;
              })
              .map(this._makeCustomContentTypeMessageFormat)
          : null,
      };
    });
    if (rows.length === 0) return null;
    return rows[0];
  }

  getLastTimestamp(
    table:
      | CHAT_TABLES.PATHS
      | CHAT_TABLES.MESSAGES
      | CHAT_TABLES.PEERS
      | CHAT_TABLES.DELETE_LOGS
      | 'notifications',
    path?: string,
    patp?: string
  ): number {
    if (!this.db?.open) return 0;
    const where =
      path && patp ? ` WHERE path = '${path}' and sender != '${patp}'` : '';
    const column =
      table === CHAT_TABLES.DELETE_LOGS ? 'timestamp' : 'received_at';

    const query = this.db.prepare(`
      SELECT max(${column}) as lastTimestamp
      FROM ${table}${where};
    `);
    const result: any = query.all();
    // subtract 1 to ensure re-fetching that same timestamp so we don't have timing issues
    return Math.max(result[0]?.lastTimestamp - 1, 0) || 0;
  }

  selectMessageCountForPath(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(`
      SELECT count(*)
      FROM ${CHAT_TABLES.MESSAGES}
      WHERE path = '${path}'`);
    const result = query.all();
    return result[0]['count(*)'];
  }

  findChatDM(peer: string, our: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(`
      SELECT DISTINCT path
      FROM ${CHAT_TABLES.PEERS}
      WHERE ship = '${peer}'
      AND path NOT IN (
        SELECT path
        FROM ${CHAT_TABLES.PEERS}
        WHERE ship NOT IN ('${peer}', '${our}')
      )
      `);
    const result = query.all();
    return result;
  }

  getChatPeers(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(`
      SELECT ship, role
      FROM ${CHAT_TABLES.PEERS}
      WHERE path = ?;
    `);
    const result = query.all(path);
    return result;
  }

  getChatPeer(path: string, ship: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(`
      SELECT *
      FROM ${CHAT_TABLES.PEERS}
      WHERE path = ? AND ship = ?;
    `);
    const result = query.all(path, ship);
    if (result.length === 0) return null;
    return result[0];
  }

  //
  // Inserts
  //

  setPinned(path: string, pinned: boolean) {
    if (!this.db?.open) return;

    const sql1 = this.db.prepare(
      `UPDATE ${CHAT_TABLES.PATHS_FLAGS} SET pinned = ${
        pinned ? 1 : 0
      } WHERE path = ?;`
    );
    return sql1.run(path);
  }

  setMuted(path: string, muted: boolean) {
    if (!this.db?.open) return;

    const sql1 = this.db.prepare(
      `UPDATE ${CHAT_TABLES.PATHS_FLAGS} SET muted = ${
        muted ? 1 : 0
      } WHERE path = ?;`
    );
    return sql1.run(path);
  }

  private _insertMessages(messages: MessagesRow[]) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO ${CHAT_TABLES.MESSAGES} (
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
        expires_at,
        received_at
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
        @expires_at,
        @received_at
      )`
    );
    const insertMany = this.db.transaction((messages: any) => {
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
          received_at: message['received-at'] || 0, // fall bock to zero since we have not-null constraint
        });
      }
    });
    insertMany(messages);
  }

  private _insertPaths(paths: PathsRow[]) {
    if (!this.db?.open) return;
    if (!paths) return;
    const insert = this.db.prepare(
      `REPLACE INTO ${CHAT_TABLES.PATHS} (
          path, 
          type, 
          metadata, 
          peers_get_backlog,
          pins,
          max_expires_at_duration,
          invites,
          created_at, 
          updated_at,
          received_at
        ) VALUES (@path, @type, @metadata, @peers_get_backlog, @pins, @max_expires_at_duration, @invites, @created_at, @updated_at, @received_at)`
    );
    const insertMany = this.db.transaction((paths: any) => {
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
          received_at: path['received-at'] || 0, // fall bock to zero since we have not-null constraint
        });
    });
    insertMany(paths);
  }

  private _insertPeers(peers: PeersRow[]) {
    if (!this.db?.open) return;
    if (!peers) return;
    const insert = this.db.prepare(
      `REPLACE INTO ${CHAT_TABLES.PEERS} (
          path, 
          ship, 
          role,
          created_at, 
          updated_at,
          received_at
        ) VALUES (@path, @ship, @role, @created_at, @updated_at, @received_at)`
    );
    const insertMany = this.db.transaction((peers: any) => {
      for (const peer of peers)
        insert.run({
          path: peer.path,
          ship: peer.ship,
          role: peer.role,
          created_at: peer['created-at'],
          updated_at: peer['updated-at'],
          received_at: peer['received-at'] || 0, // fall bock to zero since we have not-null constraint
        });
    });
    insertMany(peers);
  }

  private async _applyDeleteLogs(deleteLogs: DeleteLogRow[]) {
    deleteLogs.forEach((deleteLog) => {
      this._handleDeletes(deleteLog.change);
    });
  }

  private _insertDeleteLogs(deleteLogs: DeleteLogRow[]) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO ${CHAT_TABLES.DELETE_LOGS} (
          change, 
          timestamp
        ) VALUES (@change, @timestamp)`
    );
    const insertMany = this.db.transaction((deleteLogs: any) => {
      for (const deleteLog of deleteLogs)
        insert.run({
          change: JSON.stringify(deleteLog.change),
          timestamp: deleteLog.timestamp,
        });
    });
    insertMany(deleteLogs);
  }

  private _deletePathsRow(path: string) {
    if (!this.db?.open) return;
    const deletePath = this.db.prepare(
      `DELETE FROM ${CHAT_TABLES.PATHS} WHERE path = ?`
    );
    deletePath.run(path);
    // delete all messages in that path
    const deleteMessages = this.db.prepare(
      `DELETE FROM ${CHAT_TABLES.MESSAGES} WHERE path = ?`
    );
    deleteMessages.run(path);
    // delete all peers in that path
    const deletePeers = this.db.prepare(
      `DELETE FROM ${CHAT_TABLES.PEERS} WHERE path = ?`
    );
    deletePeers.run(path);
  }

  private _deletePeersRow(path: string, peer: string) {
    if (!this.db?.open) return;
    const deletePath = this.db.prepare(
      `DELETE FROM ${CHAT_TABLES.PEERS} WHERE path = ? AND ship = ?`
    );
    deletePath.run(path, peer);
  }

  private _deleteMessagesRow(msgId: string) {
    if (!this.db?.open) return;
    const deleteMessage = this.db.prepare(
      `DELETE FROM ${CHAT_TABLES.MESSAGES} WHERE msg_id = ?`
    );
    deleteMessage.run(msgId);
    // insert into delete logs
  }
}

export const chatDBPreload = ChatDB.preload(
  new ChatDB({ preload: true, name: 'chatDB' })
);
