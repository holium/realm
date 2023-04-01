import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../../../services/abstract.db';

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
    super(db, 'chat');
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
