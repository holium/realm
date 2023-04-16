import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../abstract.db';
import { APIConnection } from '../../conduit';
import {
  WalletsRow,
  AddRow,
  UpdateRow,
  UpdateTransaction,
  DelTransactionsRow,
  WalletDbOps,
  DelWalletsRow,
  TransactionsRow,
} from './wallet.types';

export class WalletDB extends AbstractDataAccess<WalletRow> {
  constructor(params: DataAccessContructorParams) {
    params.name = 'walletDB';
    params.tableName = 'wallets';
    params.tableName = 'transactions';
    super(params);
    if (params.preload) return;
    this._onQuit = this._onQuit.bind(this);
    this._onError = this._onError.bind(this);
    this._onDbUpdate = this._onDbUpdate.bind(this);
    this._handleDBChange = this._handleDBChange.bind(this);
    this.init = this.init.bind(this);
    APIConnection.getInstance().conduit.watch({
      app: 'realm-wallet',
      path: '/updates',
      onEvent: this._onDbUpdate,
      onQuit: this._onQuit,
      onError: this._onError,
    });
    this.init();
  }

  async init() {
    const transactions = await this._fetchTransactions();
    const wallets = await this._fetchWallets();
    // const deleteLogs = await this._fetchDeleteLogs();
    this._insertTransactions(transactions);
    this._insertWallets(wallets);
    // Missed delete events must be applied after inserts
    /*this._applyDeleteLogs(deleteLogs).then(() => {
      // and after applying successfully, insert them into the db
      this._insertDeleteLogs(deleteLogs);
    });*/
  }

  protected mapRow(row: any): WalletRow {
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

  private async _fetchTransactions() {
    const lastTimestamp = this.getLastTimestamp('transactions');
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

  private async _fetchWallets() {
    const lastTimestamp = this.getLastTimestamp('wallets');
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'chat-db',
      path: `/db/paths/start-ms/${lastTimestamp}`,
    });
    return response?.tables.paths;
  }

  private _onDbUpdate(data: any /*WalletDbReactions*/, _id?: number) {
    console.log('SENDING UPDATE');
    this.sendUpdate(data);
    if ('tables' in data) {
      this._insertTransactions(data.tables.transactions);
      this._insertWallets(data.tables.wallets);
    } else if (Array.isArray(data)) {
      if (
        data.length > 1 &&
        data[0].type === 'add-row' &&
        data[0].table === 'transactions'
      ) {
        const messages = data.map(
          (row) => (row as AddRow).row as WalletsRow
        ) as WalletsRow[];
        this._insertTransactions(messages);
        const msg = this.getChatMessage(messages[0]['msg-id']);
        this.sendUpdate({ type: 'message-received', payload: msg });
      } else {
        data.forEach(this._handleDBChange);
      }
    } else {
      console.log(data);
    }
  }

  private _handleDBChange(dbChange: WalletDbOps) {
    if (dbChange.type === 'add-row') {
      const addRow = dbChange as AddRow;
      switch (addRow.table) {
        case 'transactions':
          const message = addRow.row as TransactionsRow;
          this._insertTransactions([message]);
          const msg = this.getChatMessage(message['msg-id']);
          this.sendUpdate({ type: 'message-received', payload: msg });
          break;
        case 'wallets':
          const path = addRow.row as WalletsRow;
          this._insertWallets([path]);
          const chat = this.getChat(path.path);
          this.sendUpdate({ type: 'path-added', payload: chat });
          break;
      }
    }
    if (dbChange.type === 'update') {
      const update = dbChange as UpdateRow;
      switch (update.table) {
        case 'transactions':
          const message = update as UpdateTransaction;
          const msgId = message.message[0]['msg-id'];
          this._insertTransactions(message.message);
          const msg = this.getChatMessage(msgId);
          this.sendUpdate({ type: 'message-edited', payload: msg });
          break;
        case 'wallets':
          const path = update.row as WalletsRow;
          this._insertWallets([path]);
          const chat = this.getChat(path.path);
          this.sendUpdate({ type: 'path-updated', payload: chat });
          break;
      }
    }
    if (
      dbChange.type === 'del-transactions-row' ||
      dbChange.type === 'del-wallets-row'
    ) {
      this._handleDeletes(dbChange);
    }
  }

  private _handleDeletes(dbChange: DelTransactionsRow | DelWalletsRow) {
    // insert into delete_logs
    if (dbChange.type === 'del-transactions-row') {
      const delMessagesRow = dbChange as DelTransactionsRow;
      this._deleteTransactionsRow(delMessagesRow['msg-id']);
      this.sendUpdate({ type: 'message-deleted', payload: delMessagesRow });
      this._insertDeleteLogs([
        {
          change: delMessagesRow,
          timestamp: delMessagesRow.timestamp,
        },
      ]);
    }
    if (dbChange.type === 'del-wallets-row') {
      const delPathsRow = dbChange as DelWalletsRow;
      this._deletePathsRow(delPathsRow.row);
      this.sendUpdate({ type: 'path-deleted', payload: delPathsRow.row });
      this._insertDeleteLogs([
        {
          change: delPathsRow,
          timestamp: delPathsRow.timestamp,
        },
      ]);
    }
  }

  private _onQuit() {
    console.log('fail!');
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
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
        WITH formed_messages AS (
          WITH formed_fragments AS (
              WITH realm_chat as (
                  SELECT *
                  FROM messages
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
        WHERE paths.path LIKE '%realm-chat%' OR paths.path LIKE '/spaces/%/chats/%'
        ORDER BY
            chat_with_messages.created_at DESC,
            json_extract(json(metadata), '$.timestamp') DESC;
      `);
    const result: any = query.all();

    return result.map((row: any) => {
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
        metadata: row.metadata ? this._parseMetadata(row.metadata) : null,
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
    const result: any = query.all(
      `~${APIConnection.getInstance().conduit.ship}`,
      path
    );

    const rows = result.map((row: any) => {
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
        metadata: row.metadata ? this._parseMetadata(row.metadata) : null,
        lastMessage,
      };
    });
    if (rows.length === 0) return null;
    return rows[0];
  }

  getChatLog(path: string, _params?: { start: number; amount: number }) {
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
    const result: any = query.all(path);
    return result.map((row: any) => {
      return {
        ...row,
        metadata: row.metadata ? this._parseMetadata(row.metadata) : [null],
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

  getReplyToMessage(replyId: string) {
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
    const result: any = query.all(msgId);
    const rows = result.map((row: any) => {
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
    const result: any = query.all();
    // add 1 to avoid getting same timestamp again
    return result[0]?.lastTimestamp + 1 || 0;
  }

  getChatPeers(path: string) {
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

  private _insertTransactions(transactions: TransactionsRow[]) {
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
    insertMany(transactions);
  }

  private _insertWallets(wallets: WalletsRow[]) {
    if (!this.db) throw new Error('No db connection');
    if (!wallets) return;
    /*const insert = this.db.prepare(
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
    insertMany(paths);*/
  }

  private async _applyDeleteLogs(deleteLogs: DeleteLogRow[]) {
    deleteLogs.forEach((deleteLog) => {
      this._handleDeletes(deleteLog.change);
    });
  }

  private _insertDeleteLogs(deleteLogs: DeleteLogRow[]) {
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

  private _deletePathsRow(path: string) {
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

  private _deletePeersRow(path: string, peer: string) {
    if (!this.db) throw new Error('No db connection');
    const deletePath = this.db.prepare(
      'DELETE FROM peers WHERE path = ? AND ship = ?'
    );
    console.log(`deleting peer ${peer} on ${path}`);
    deletePath.run(path, peer);
  }

  private _deleteTransactionsRow(msgId: string) {
    if (!this.db) throw new Error('No db connection');
    const deleteTransaction = this.db.prepare(
      'DELETE FROM transactions WHERE msg_id = ?'
    );
    console.log('deleting msgId', msgId);
    deleteTransaction.run(msgId);
    // insert into delete logs
  }
}

export const walletInitSql = `
  create table if not exists transactions
  (
    hash           text    not null,
    network        text    not null,
    type           text    not null,
    initiated_at   integer not null,
    completed_at   integer,
    our_address    text    not null,
    their_patp     text,
    their_address  text    not null,
    status         text    not null,
    failure_reason text,
    notes          text
);
  
  create unique index if not exists messages_path_msg_id_msg_part_id_uindex
      on messages (path, msg_id, msg_part_id);
  
  create table if not exists wallets
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
  `;

export const walletDBPreload = WalletDB.preload(
  new WalletDB({ preload: true, name: 'walletDB' })
);
