import { DBAccount } from './accounts.table';

export type AuthUpdateAccountPayload = {
  account: DBAccount;
  order: string[];
};

export type AuthUpdateSeenSplash = {
  type: 'seen-splash';
  payload: boolean;
};

export type AuthUpdateInit = {
  type: 'auth-init';
  payload: DBAccount[];
};

export type AuthUpdateLoginFailed = {
  type: 'auth-failed';
  payload: Error;
};

export type AuthUpdateAccountAdded = {
  type: 'account-added';
  payload: AuthUpdateAccountPayload;
};

export type AuthUpdateAccountRemoved = {
  type: 'account-removed';
  payload: AuthUpdateAccountPayload;
};

export type AuthUpdateAccountUpdated = {
  type: 'account-updated';
  payload: AuthUpdateAccountPayload;
};

export type AuthUpdateTypes =
  | AuthUpdateSeenSplash
  | AuthUpdateInit
  | AuthUpdateAccountAdded
  | AuthUpdateAccountRemoved
  | AuthUpdateAccountUpdated
  | AuthUpdateLoginFailed;
