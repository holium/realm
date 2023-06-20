export type Path = string;
export type Ship = string;

export type Role = string;
export type Type = string;
export type RowID = string;

export type PeerParm = {
  ship: Ship;
  role: Role;
};

export type PeerParms = PeerParm[];

export interface Peer {
  path: Path;
  ship: Ship;
  role: Role;
  createdAt: number;
  updatedAt: number;
  receivedAt: number;
}

export interface BedrockRow {
  [key: string]: any;
  path: Path;
  id: RowID;
  type: Type;
  v: number;
  created_at: number;
  updated_at: number;
  received_at: number;
}

export type Replication = 'host' | 'gossip' | 'shared-host';
export type PermissionScope = 'table' | 'own' | 'none';

export type AccessRule = {
  create: boolean;
  edit: PermissionScope;
  delete: PermissionScope;
};

export type AccessRules = Record<Role, AccessRule>;
export type TableAccess = Record<Type, AccessRules>;

export type UniqueColumns = Set<string>;

export type Constraint = {
  type: Type;
  uniques: Set<UniqueColumns>;
  check: null;
};

export interface PathRow {
  path: Path;
  host: Ship;
  replication: Replication;
  defaultAccess: AccessRules;
  tableAccess: TableAccess;
  constraints: Set<Constraint>;
  createdAt: number;
  updatedAt: number;
  receivedAt: number;
}
export interface WordRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  word: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-word';
}

export interface DefinitionRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  definition: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-sentence';
  word_id: string; //id of parent word row
}
export interface SentenceRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  definition: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-definition';
  word_id: string; //id of parent word row
}
export interface SentenceRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  sentence: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-definition';
  word_id: string; //id of parent word row
}
export interface VoteRow {
  id: string;
  parent_id: string;
  parent_type: string;
  path: string; //path to a space in realm for Lexicon's use case
  parent_path: string;
  created_at: number; //date
  received_at: number; //date
  definition: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?
  ship: string;
  type: 'vote';
  up: boolean;
}
export type LeixconRow = VoteRow | WordRow | DefinitionRow | SentenceRow;

export interface addRowUpdate {
  change: 'add-row';
  row: LeixconRow;
}
export interface updateRowUpdate {
  change: 'upd-row';
  row: LeixconRow;
}
export interface deleteRowUpdate {
  change: 'del-row';
  path: string;
  type: Type;
  id: RowID;
  timestamp: number; //date
}

export interface addPathUpdate {
  change: 'add-path';
  row: PathRow;
}

export interface updPathUpdate {
  change: 'upd-path';
  row: PathRow;
}

export interface delPathUpdate {
  change: 'del-path';
  path: Path;
}

export interface addPeerUpdate {
  change: 'add-peer';
  peer: Peer;
}

export interface updPeerUpdate {
  change: 'upd-peer';
  peer: Peer;
}

export interface delPeerUpdate {
  change: 'del-peer';
  path: Path;
  ship: Ship;
  t: number;
}

export type dbChange =
  | addRowUpdate
  | updateRowUpdate
  | deleteRowUpdate
  | addPathUpdate
  | updPathUpdate
  | delPathUpdate
  | addPeerUpdate
  | updPeerUpdate
  | delPeerUpdate;

export type dbChanges = dbChange[];

// Available Column Types:
//   'rd'   -->
//   'ud'   --> Number
//   'da'   -->
//   'dr'   -->
//   't'    -->
//   'p'    -->
//   'id'   -->
//   'unit' -->
//   'path' -->
//   'list' -->
//   'set'  -->
//   'map'  -->
//
