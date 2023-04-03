import AbstractService, { ServiceOptions } from '../abstract.service';
import log from 'electron-log';
import APIConnection from '../conduit';
import { NotificationsDB } from './models/notifications.model';
import { Database } from 'better-sqlite3-multiple-ciphers';

export class NotificationsService extends AbstractService {
  protected notifDB?: NotificationsDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('notificationService', options);
    if (options?.preload) {
      return;
    }
    this.notifDB = new NotificationsDB(false, db);
  }

  public getNotifications() {
    return this.notifDB?.getNotifications();
  }
}

export default NotificationsService;

// Generate preload
export const roomsPreload = NotificationsService.preload(
  new NotificationsService({ preload: true })
);
