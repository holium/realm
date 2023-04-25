import { Account } from './accounts.table';

export type Theme = {
  mode: 'light' | 'dark';
  backgroundColor: string;
  accentColor: string;
  inputColor: string;
  dockColor: string;
  iconColor: string;
  textColor: string;
  windowColor: string;
  wallpaper: string;
  mouseColor: string;
};

export type AccountModelType = {
  url: string;
  patp: string;
  type: 'hosted' | 'local';
  nickname: string | null;
  color: string | null;
  avatar: string | null;
  theme: Theme;
  status: string | null;
  createdAt: number;
  updatedAt: number;
};

export type AccountView = Omit<Account, 'passwordHash'>;

export type AuthUpdateAccountPayload = {
  account: AccountView;
  order: string[];
};

export type AuthUpdateSeenSplash = {
  type: 'seen-splash';
  payload: boolean;
};

export type AuthUpdateInit = {
  type: 'auth-init';
  payload: Account[];
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
