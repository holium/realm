import { ipcMain, ipcRenderer, app, IpcRendererEvent } from 'electron';
import { BaseService } from '../base.service';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Patp } from '../../types';
import { Realm } from '../..';
import {
  DbChangeType,
  AddRow,
  UpdateRow,
  UpdateAll,
  DelRow,
  NotifDbOps,
  NotifDbChangeReactions,
  NotifDbReactions,
  NotificationsRow,
} from './notification.types';

const pokeHelper = async (core: any, payload: any, errMsg: string) => {
  if (!core.conduit) throw new Error('No conduit connection');
  try {
    await core.conduit.poke(payload);
  } catch (err) {
    console.error(err);
    throw new Error(errMsg);
  }
};

export class NotificationService extends BaseService {
  db: Database.Database | null = null;
  initSql = fs.readFileSync(`${path.resolve(__dirname)}/init.sql`, 'utf8');
  lastTimestamp = 0;

  /**
   * Handlers for the ipcRenderer invoked functions
   **/
  handlers = {
    'realm.notification.mark-read': this.readNotification,
    'realm.notification.dismiss': this.dismissNotification,
  };

  /**
   * Preload functions to register with the renderer
   */
  static preload = {
    readNotification: (
      appTag: string,
      path?: string,
    ) => ipcRenderer.invoke('realm.notification.mark-read', appTag, path),
    dismissNotification: (
      appTag: string,
      path?: string,
    ) => ipcRenderer.invoke('realm.notification.dismiss', appTag, path),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.onQuit = this.onQuit.bind(this);
    this.onError = this.onError.bind(this);

    this.onDbUpdate = this.onDbUpdate.bind(this);
    this.handleDBChange = this.handleDBChange.bind(this);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  // ----------------------------------------------
  // ----------------- DB setup -------------------
  // ----------------------------------------------
  async subscribe(ship: Patp) {
    this.db = new Database(`${app.getPath('userData')}/realm.${ship}/realm.db`, {
      // verbose: console.log,
    });
    this.db.exec(this.initSql);
    await this.core.conduit?.watch({
      app: 'notif-db',
      path: '/db',
      onEvent: this.onDbUpdate,
      onQuit: this.onQuit,
      onError: this.onError,
    });

    const notifications = await this.fetchNotifications();
    this.insertNotifications(notifications);
    //console.log('realm-chat unreads', await this.getUnreads(null, 'realm-chat'));
    //console.log(await this.getUnreads(null, 'realm-chat', '/new-messages'));
    //console.log(await this.readNotification(null,'realm-chat', '/new-messages'));
  }

  async fetchNotifications() {
    const lastTimestamp = this.getLastTimestamp();
    const response = await this.core.conduit?.scry({
      app: 'notif-db',
      path: `/db/since-ms/${lastTimestamp}`,
    });
    return response;
  }

  onDbUpdate(data: NotifDbChangeReactions, _id?: number) {
    if (Array.isArray(data)) {
      console.log('db update', data);
      data.forEach(this.handleDBChange);
    } else {
      console.log(data);
    }
  }

  handleDBChange(dbChange: NotifDbOps) {
    if (dbChange.type === 'add-row') {
      const addRow = dbChange as AddRow;
      console.log('add-row to notifications', addRow.row);
      const notif = addRow.row as NotificationsRow;
      this.insertNotifications([notif]);
    } else if (dbChange.type === 'update-all') {
      console.log('TODO implement updating all rows read column');
    } else if (dbChange.type === 'update-row') {
      const update = dbChange as UpdateRow;
      const notif = update.row as NotificationsRow;
      console.log('update-row', notif);
      this.insertNotifications([notif]);
    } else if (dbChange.type === 'del-row') {
      console.log('del-row', dbChange);
      const del = dbChange as DelRow;
      this.deleteNotificationsRow(del.id);
      //this.sendChatUpdate('message-deleted', delMessagesRow['msg-id']);
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
    return result.map((row) => {
      return {
        ...row,
        buttons: row.buttons ? JSON.parse(row.buttons) : null,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
      }
    });
  }


  // ------------------------------
  // ---------- Actions -----------
  // ------------------------------

  async readNotification(
    _evt: any,
    appTag: string, // if just app is passed in, will mark all notifs from app as "read"
    path?: string, // if this is also passed in, will only mark notifs with both app and path as "read"
  ) {
    // default assume only app
    let pokeJson = {
      "read-app": appTag
    };
    if (path) {
      pokeJson = {
        "read-path": {
          app: appTag,
          path
        }
      }
    }
    const payload = {
      app: 'notif-db',
      mark: 'ndb-poke',
      reaction: '',
      json: pokeJson,
    };

    await pokeHelper(this.core, payload, `Failed to mark notifications read for ${appTag}`);
  }

  async dismissNotification(
    _evt: any,
    appTag: string, // if just app is passed in, will mark all notifs from app as "read"
    path?: string, // if this is also passed in, will only mark notifs with both app and path as "read"
  ) {
    // default assume only app
    let pokeJson = {
      "dismiss-app": appTag
    };
    if (path) {
      pokeJson = {
        "dismiss-path": {
          app: appTag,
          path
        }
      }
    }
    const payload = {
      app: 'notif-db',
      mark: 'ndb-poke',
      reaction: '',
      json: pokeJson,
    };

    await pokeHelper(this.core, payload, `Failed to dismiss notifications for ${appTag}`);
  }
}
