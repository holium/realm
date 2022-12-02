import { Conduit } from '@holium/conduit';
import {
  NotificationModel,
  NotificationModelType,
} from 'os/services/spaces/models/beacon';
import { HarkStoreProvider } from './harkstore';

export const enum NotificationProviders {
  HarkStore = 'hark-store',
  Hark = 'hark',
  Beacon = 'beacon',
  Default = 'default',
}

export interface INotificationProvider {
  // all notifications regardless of status?
  all: (conduit: Conduit) => Promise<NotificationModelType[]>;
  // all unread notifications
  recent: (conduit: Conduit) => Promise<NotificationModelType[]>;
  // return value is the subscriptionId of the watch
  watch: (conduit: Conduit, path: string) => Promise<number>;
  // mark as seen. returns updated notification state
  seen: (
    conduit: Conduit,
    notification: NotificationModelType
  ) => Promise<NotificationModelType>;
  // mark as seen. returns updated notification state
  seenAll: (conduit: Conduit) => Promise<boolean>;
}

export class DefaultNotificationProvider implements INotificationProvider {
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
      return resolve(-1);
    });
  };
  // mark as seen. returns updated notification state
  seen = (
    conduit: Conduit,
    notification: NotificationModelType
  ): Promise<NotificationModelType> => {
    return new Promise((resolve, reject) => {
      return resolve(
        NotificationModel.create({
          content: '**default provider**',
          seen: false,
          time: Date.now(),
        })
      );
    });
  };
  // mark as seen. returns updated notification state
  seenAll = (conduit: Conduit): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      return resolve(false);
    });
  };
}

export const NotificationProviderFactory = {
  create: (provider: NotificationProviders): INotificationProvider => {
    switch (provider) {
      case NotificationProviders.Default:
        return new DefaultNotificationProvider();
      case NotificationProviders.HarkStore:
        return new HarkStoreProvider();
      default:
        console.error(
          'error: NotificationProviderFactory.create called with unknown provider'
        );
        throw new Error(
          'error: NotificationProviderFactory.create called with unknown provider'
        );
    }
  },
};
