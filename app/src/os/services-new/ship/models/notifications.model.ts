import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../../../services/abstract.db';

interface NotificationRow {
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

export class NotificationsDAO extends AbstractDataAccess<NotificationRow> {
  constructor(db: Database) {
    super(db, 'notifications');
  }

  protected mapRow(row: any): NotificationRow {
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

export const notifInitSql = `
create table if not exists notifications
(
    id          integer not null,
    app         TEXT not null,
    path        TEXT not null,
    type        TEXT not null,
    title       TEXT,
    content     TEXT,
    image       TEXT,
    buttons     text,
    link        TEXT,
    metadata    text,
    created_at  integer not null,
    updated_at  integer not null,
    read_at     integer,
    read        boolean,
    dismissed_at  integer,
    dismissed     boolean
);

create unique index if not exists notifications_id_uindex
    on notifications (id);

create index if not exists notifications_read_dismissed_index
    on notifications (read, dismissed);
`;
