import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import AbstractService, { ServiceOptions } from '../../abstract.service';

import { notifDBPreload, NotificationsDB } from './notifications.table';
import { NotifUpdateType } from './notifications.types';

export class NotificationsService extends AbstractService<NotifUpdateType> {
  protected notifDB?: NotificationsDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('notificationService', options);
    if (options?.preload) {
      return;
    }
    this.notifDB = new NotificationsDB({ preload: false, name: 'notifDB', db });

    if (options?.verbose) log.info('notification.service.ts:', 'Constructed.');
  }

  reset(): void {
    super.removeHandlers();
    this.notifDB?.reset();
  }
}

export default NotificationsService;

// Generate preload
// const notifServiceInstance = NotificationsService.preload(
//   new NotificationsService({ preload: true })
// );

export const notifPreload = {
  ...notifDBPreload,
};
