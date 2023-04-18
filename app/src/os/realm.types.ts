import { AccountModelType } from 'renderer/stores/models/account.model';

export type LoginErrorType =
  | 'bad-gateway'
  | 'password'
  | 'missing'
  | 'code'
  | 'unknown'
  | '';

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
    seenSplash: boolean;
  };
};

export type RealmUpdateAuthSuccess = {
  type: 'auth-success';
  payload: {
    url: string;
    patp: string;
    cookie: string;
  };
};

export type RealmUpdateAuthFailed = {
  type: 'auth-failed';
  payload: LoginErrorType;
};

export type RealmUpdateLogout = {
  type: 'logout';
  payload: {
    patp: string;
  };
};

export type RealmUpdateTypes =
  | RealmUpdateAuthSuccess
  | RealmUpdateAuthFailed
  | RealmUpdateBooted
  | RealmUpdateLogout;
