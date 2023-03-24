type PermissionsLevel = 'our' | 'space' | 'open' | 'unset' | 'yes' | 'no';
export type InviteLevel = 'read' | 'write' | 'admin' | 'block';
export type StoreType = 'kv' | 'feed';

type T = string | number | boolean | object | T[];
export type Value = T;

export interface Permissions {
  read: PermissionsLevel;
  write: PermissionsLevel;
  admin: PermissionsLevel;
}

/* user facing initTome */
export interface TomeOptions {
  realm?: boolean;
  ship?: string;
  space?: string;
}

/* User facing keyvalue init */
export interface StoreOptions {
  permissions?: Permissions;
  bucket?: string;
  onReadyChange?: (ready: boolean) => void;
  onWriteChange?: (write: boolean) => void;
  onAdminChange?: (admin: boolean) => void;
}

/* Tome() constructor */
export interface InitTomeOptions {
  tomeShip: string;
  ourShip: string;
  space: string;
  spaceForPath: string;
  app: string;
  locked: boolean;
  realm: boolean;
}

/* keyvalue() constructor */
export interface InitStoreOptions extends InitTomeOptions {
  permissions: Permissions;
  bucket: string;
  write?: boolean;
  admin?: boolean;
  onReadyChange?: (ready: boolean) => void;
  onWriteChange?: (write: boolean) => void;
  onAdminChange?: (admin: boolean) => void;
}
