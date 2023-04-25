import { Account } from './services/auth/accounts.table';
import { AccountView } from './services/auth/auth.types';
import { MasterAccount } from './services/auth/masterAccounts.table';

export type CreateAccountPayload = Omit<Account, 'updatedAt' | 'createdAt'>;

export type CreateMasterAccountPayload = Omit<MasterAccount, 'id'>;

export type LoginErrorType =
  | 'bad-gateway'
  | 'password'
  | 'missing'
  | 'code'
  | 'unknown'
  | '';

export type RealmSession = {
  url: string;
  patp: string;
  cookie: string;
};

export type RealmUpdateBooted = {
  type: 'booted';
  payload: {
    accounts: AccountView[] | undefined;
    session?: RealmSession | null;
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
