import AbstractService, { ServiceOptions } from '../abstract.service';
import log from 'electron-log';
import APIConnection from '../conduit';
import { notifDBPreload, NotificationsDB } from './models/notifications.model';
import { Database } from 'better-sqlite3-multiple-ciphers';

export class NotificationsService extends AbstractService {
  protected notifDB?: NotificationsDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('notificationService', options);
    if (options?.preload) {
      return;
    }
    this.notifDB = new NotificationsDB({ preload: false, name: 'notifDB', db });
  }
}

export default NotificationsService;

// Generate preload
const notifServiceInstance = NotificationsService.preload(
  new NotificationsService({ preload: true })
);

export const notifPreload = {
  ...notifDBPreload,
  ...notifServiceInstance,
};
