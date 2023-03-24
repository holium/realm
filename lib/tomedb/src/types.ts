type PermLevel = 'our' | 'space' | 'open' | 'unset' | 'yes' | 'no';

export interface Perm {
  read: PermLevel;
  write: PermLevel;
  admin: PermLevel;
}

export interface TomeOptions {
  realm?: boolean;
  ship?: string;
  space?: string;
  permissions?: Perm;
}
