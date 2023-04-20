import { AccountModelType } from 'renderer/stores/models/account.model';

export type RealmUpdateBooted = {
  type: 'booted';
  payload: {
    accounts: AccountModelType[];
    screen: 'login' | 'onboarding' | 'os';
    session?: {
      url: string;
      patp: string;
      cookie: string;
    };
  };
};

export type RealmUpdateAuthenticated = {
  type: 'authenticated';
  payload: {
    url: string;
    patp: string;
    cookie: string;
  };
};

export type RealmUpdateLogout = {
  type: 'logout';
  payload: {
    patp: string;
  };
};

export type RealmUpdateTypes =
  | RealmUpdateAuthenticated
  | RealmUpdateBooted
  | RealmUpdateLogout;
