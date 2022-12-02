import { INotificationProvider } from '.';
import { NotificationModelType } from 'os/services/spaces/models/beacon';

import { Conduit } from '@holium/conduit';

export class HarkStoreProvider implements INotificationProvider {
  // all notifications regardless of status?
  all = (conduit: Conduit): Promise<NotificationModelType[]> => {
    return new Promise(async (resolve) => {
      return resolve([]);
    });
  };
  // all unread notifications
  recent = (conduit: Conduit): Promise<NotificationModelType[]> => {
    return new Promise(async (resolve, reject) => {
      return resolve([]);
    });
  };
  // return value is the subscriptionId of the watch
  watch = (conduit: Conduit, path: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      return reject('not-implemented');
    });
  };
  // mark as seen. returns updated notification state
  seen = (
    conduit: Conduit,
    notification: NotificationModelType
  ): Promise<NotificationModelType> => {
    return new Promise((resolve, reject) => {
      return reject('not-implemented');
    });
  };
  // mark as seen. returns updated notification state
  seenAll = (conduit: Conduit): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      return reject('not-implemented');
    });
  };
}
