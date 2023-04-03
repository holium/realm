import { Database } from 'better-sqlite3';
import APIConnection from '../../conduit';
import AbstractDataAccess from '../../abstract.db';
import {
  AddRow,
  DelRow,
  NotifDbChangeReactions,
  NotifDbOps,
  NotificationsRow,
  UpdateRow,
} from './notifications.types';

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

type NotifMobxUpdateType =
  | 'notification-added'
  | 'notification-updated'
  | 'notification-deleted';

type GetParamsObj = {
  app?: string;
  path?: string;
  excludeDismissed?: boolean;
  excludeRead?: boolean;
};

export class NotificationsDB extends AbstractDataAccess<NotificationRow> {
  constructor(preload: boolean = true, db?: Database) {
    super(preload, db, 'notifications');
    if (preload) return;
    this.onQuit = this.onQuit.bind(this);
    this.onError = this.onError.bind(this);

    this.onDbUpdate = this.onDbUpdate.bind(this);
    this.handleDBChange = this.handleDBChange.bind(this);
    this.init = this.init.bind(this);
    APIConnection.getInstance().conduit.watch({
      app: 'notif-db',
      path: '/db',
      onEvent: this.onDbUpdate,
      onQuit: this.onQuit,
      onError: this.onError,
    });
    this.init();
  }

  async init() {
    const notifications = await this.fetchNotifications();
    this.insertNotifications(notifications);
    // Missed delete events must be applied after inserts
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

  async fetchNotifications() {
    const lastTimestamp = this.getLastTimestamp();
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'notif-db',
      path: `/db/since-ms/${lastTimestamp}`,
    });
    return response;
  }

  onDbUpdate(data: NotifDbChangeReactions, _id?: number) {
    if (Array.isArray(data)) {
      data.forEach(this.handleDBChange);
    } else {
      console.log(data);
    }
  }

  handleDBChange(dbChange: NotifDbOps) {
    if (dbChange.type === 'add-row') {
      const addRow = dbChange as AddRow;
      // console.log('add-row to notifications', addRow.row);
      const notif = addRow.row as NotificationsRow;
      this.insertNotifications([notif]);
      const notifQueried = this.getNotification(notif.id);
      this.sendUpdate({ type: 'notification-added', payload: notifQueried });
    } else if (dbChange.type === 'update-all') {
      // console.log('TODO implement updating all rows read column');
    } else if (dbChange.type === 'update-row') {
      const update = dbChange as UpdateRow;
      const notif = update.row as NotificationsRow;
      // console.log('update-row', notif);
      this.insertNotifications([notif]);
      const notifUpdatedQueried = this.getNotification(notif.id);
      this.sendUpdate({
        type: 'notification-updated',
        payload: notifUpdatedQueried,
      });
    } else if (dbChange.type === 'del-row') {
      console.log('del-row', dbChange);
      const del = dbChange as DelRow;
      this.deleteNotificationsRow(del.id);
      this.sendUpdate({ type: 'notification-deleted', payload: del.id });
    }
  }

  onQuit() {
    console.log('fail!');
  }

  onError(err: any) {
    console.log('err!', err);
  }

  insertNotifications(notifications: NotificationsRow[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO notifications (
        id,
        app,
        path,
        type,
        title,
        content,
        image,
        buttons,
        link,
        metadata,
        created_at,
        updated_at,
        read_at,
        read,
        dismissed_at,
        dismissed
      ) VALUES (
        @id,
        @app,
        @path,
        @type,
        @title,
        @content,
        @image,
        @buttons,
        @link,
        @metadata,
        @created_at,
        @updated_at,
        @read_at,
        @read,
        @dismissed_at,
        @dismissed
      )`
    );
    const insertMany = this.db.transaction((notifications) => {
      for (const notif of notifications) {
        insert.run({
          id: notif.id,
          app: notif.app,
          path: notif.path,
          type: notif.type,
          title: notif.title,
          content: notif.content,
          image: notif.image,
          buttons: JSON.stringify(notif.buttons),
          link: notif.link,
          metadata: JSON.stringify(notif.metadata),
          created_at: notif['created-at'],
          updated_at: notif['updated-at'],
          read_at: notif['read-at'],
          read: notif.read ? 1 : 0,
          dismissed_at: notif['dismissed-at'],
          dismissed: notif.dismissed ? 1 : 0,
        });
      }
    });
    insertMany(notifications);
  }

  deleteNotificationsRow(id: number) {
    if (!this.db) throw new Error('No db connection');
    const deleteQuery = this.db.prepare(
      'DELETE FROM notifications WHERE id = ?'
    );
    console.log('deleting notif id', id);
    deleteQuery.run(id);
  }

  // ----------------------------------------------
  // ----------------- DB queries -----------------
  // ----------------------------------------------

  getLastTimestamp(): number {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT max(updated_at) as lastTimestamp
      FROM notifications;
    `);
    const result = query.all();
    // add 1 to avoid getting same timestamp again
    return result[0].lastTimestamp + 1 || 0;
  }

  getUnreads(_evt: any, appTag: string, path?: string) {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT *
      FROM notifications
      WHERE app = ? ${path ? 'AND path = ?' : ''};
    `);
    let result: any;
    if (path) {
      result = query.all(appTag, path);
    } else {
      result = query.all(appTag);
    }
    return result.map((row: any) => {
      return {
        ...row,
        buttons: row.buttons ? JSON.parse(row.buttons) : null,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
      };
    });
  }

  getNotifications(_params?: GetParamsObj) {
    if (!this.db) throw new Error('No db connection');

    const query = this.db.prepare(`
      ${QUERY_NOTIFICATIONS} 
      WHERE dismissed = 0 
      ORDER BY notifications.created_at DESC
    `);

    const result = query.all();
    return result.map(this.mapRow);
  }

  getNotification(id: number) {
    if (!this.db) throw new Error('No db connection');

    const query = this.db.prepare(`
      ${QUERY_NOTIFICATIONS} WHERE id = ?
    `);

    const result = query.all(id);
    return result.map(this.mapRow)[0] || [];
  }

  // ------------------------------
  // ---------- Actions -----------
  // ------------------------------

  async readNotification(
    _evt: any,
    app: string, // if just app is passed in, will mark all notifs from app as "read"
    path?: string, // if this is also passed in, will only mark notifs with both app and path as "read"
    id?: number // if this is also passed in, will only mark notif with id as "read"
  ) {
    // default assume only app
    let pokeJson;
    if (id) {
      pokeJson = {
        'read-id': id,
      };
    } else if (path) {
      pokeJson = {
        'read-path': {
          app,
          path,
        },
      };
    } else {
      pokeJson = {
        'read-app': app,
      };
    }
    const payload = {
      app: 'notif-db',
      mark: 'notif-db-poke',
      reaction: '',
      json: pokeJson,
    };

    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error('Failed to mark notifications read for', app, err);
    }
  }

  async dismissNotification(
    _evt: any,
    app: string, // if just app is passed in, will mark all notifs from app as "read"
    path?: string, // if this is also passed in, will only mark notifs with both app and path as "read"
    id?: number // if this is also passed in, will only mark notif with id as "read"
  ) {
    // default assume only app
    let pokeJson;
    if (id) {
      pokeJson = {
        'dismiss-id': id,
      };
    } else if (path) {
      pokeJson = {
        'dismiss-path': {
          app,
          path,
        },
      };
    } else {
      pokeJson = {
        'dismiss-app': app,
      };
    }
    const payload = {
      app: 'notif-db',
      mark: 'notif-db-poke',
      reaction: '',
      json: pokeJson,
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error('Failed to dismiss notifications for ', app, err);
    }
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

export const QUERY_NOTIFICATIONS = `
  SELECT id,
    app,
    notifications.path,
    notifications.type,
    title,
    content,
    image,
    buttons,
    link,
    notifications.metadata,
    paths.metadata pathMetadata,
    notifications.created_at   createdAt,
    notifications.updated_at   updatedAt,
    read_at      readAt,
    read,
    dismissed_at dismissedAt,
    dismissed
  FROM notifications 
  LEFT OUTER JOIN paths ON notifications.path = paths.path
`;

export const notifPreload = NotificationsDB.preload(new NotificationsDB(true));
