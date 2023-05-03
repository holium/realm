import { DBAccount } from './services/auth/accounts.table';
import { MasterAccount } from './services/auth/masterAccounts.table';

export type CreateAccountPayload = Omit<DBAccount, 'updatedAt' | 'createdAt'>;

export type CreateMasterAccountPayload = Omit<MasterAccount, 'id'>;

export type LoginErrorType =
  | 'bad-gateway'
  | 'password'
  | 'missing'
  | 'code'
  | 'unknown'
  | '';

export type RealmSessionCredentials = {
  serverId: string;
  serverUrl: string;
  cookie: string;
};

export type RealmUpdateBooted = {
  type: 'booted';
  payload: {
    accounts: DBAccount[] | undefined;
    session?: RealmSessionCredentials | null;
    seenSplash: boolean;
  };
};

export type RealmUpdateAuthSuccess = {
  type: 'auth-success';
  payload: {
    serverId: string;
    serverUrl: string;
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
    serverId: string;
  };
};

export type RealmUpdateTypes =
  | RealmUpdateAuthSuccess
  | RealmUpdateAuthFailed
  | RealmUpdateBooted
  | RealmUpdateLogout;
