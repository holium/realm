import { AccountModelType } from '../../../renderer/stores/models/Account.model';

export type AuthUpdateAccountPayload = {
  account: AccountModelType;
  order: string[];
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
  | AuthUpdateAccountAdded
  | AuthUpdateAccountRemoved
  | AuthUpdateAccountUpdated
  | AuthUpdateLoginFailed;
