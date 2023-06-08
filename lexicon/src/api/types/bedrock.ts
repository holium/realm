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

export type KeyPair = [name: string, t: string];
export type Schema = KeyPair[];

export interface BedrockRow {
  [key: string]: any;
  path: Path;
  id: RowID;
  type: Type;
  v: number;
  'created-at': number;
  'updated-at': number;
  'received-at': number;
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

// Bedrock updates
export interface addRowUpdate {
  change: 'add-row';
  row: BedrockRow;
}

export interface updRowUpdate {
  change: 'upd-row';
  row: BedrockRow;
}

export interface delRowUpdate {
  change: 'del-row';
  path: Path;
  type: Type;
  id: RowID;
  t: number;
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
  | updRowUpdate
  | delRowUpdate
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
