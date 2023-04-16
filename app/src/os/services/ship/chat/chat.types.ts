import { InvitePermissionType } from 'renderer/apps/Courier/models';

export type PathsRow = {
  path: string;
  type: string;
  metadata: any;
  invites: InvitePermissionType;
  pins: string[];
  'max-expires-at-duration': number;
  'peers-get-backlog': boolean;
  'created-at': number;
  'updated-at': number;
};

export type MessagesRow = {
  path: string;
  sender: string;
  'msg-id': string;
  'msg-part-id': number;
  content: {
    [key: string]: string;
  };
  'reply-to': string;
  metadata: any;
  'created-at': number;
  'updated-at': number;
  'expires-in': number | null;
};

export type PeersRow = {
  path: string;
  ship: string;
  role: string;
};

export type ChatTables = 'messages' | 'paths' | 'peers';
export type DbChangeType =
  | 'del-peers-row'
  | 'del-paths-row'
  | 'del-messages-row'
  | 'add-row'
  | 'update';

export type AddRow = {
  table: ChatTables;
  type: 'add-row';
  row: PathsRow | MessagesRow | PeersRow;
};

export type UpdateRow =
  | {
      table: ChatTables;
      type: 'update';
      row: PathsRow | MessagesRow | PeersRow;
    }
  | UpdateMessage;

export type UpdateMessage = {
  table: 'messages';
  type: 'update';
  message: MessagesRow[];
};

export type DelPeersRow = {
  table: ChatTables;
  type: 'del-peers-row';
  row: string;
  ship: string;
  timestamp: number;
};
export type DelPathsRow = {
  table: ChatTables;
  type: 'del-paths-row';
  row: string;
  timestamp: number;
};
export type DelMessagesRow = {
  table: ChatTables;
  type: 'del-messages-row';
  path: string;
  'msg-id': string;
  timestamp: number;
};

export type ChatDbOps =
  | AddRow
  | DelPeersRow
  | DelPathsRow
  | DelMessagesRow
  | UpdateRow;

export type DeleteLogRow = {
  change: DelPeersRow | DelPathsRow | DelMessagesRow;
  timestamp: number;
};

export type ChatDbChangeReactions =
  | AddRow[]
  | DelPeersRow[]
  | DelPathsRow[]
  | DelMessagesRow[];

export type ChatDbReactions =
  | {
      tables: { messages: MessagesRow[]; paths: PathsRow[]; peers: PeersRow[] };
    }
  | ChatDbChangeReactions;

export type NotificationsRow = {
  id: number;
  app: string;
  path: string;
  type: string;
  title: string;
  content: string;
  image: string;
  buttons: any;
  link: string;
  metadata: any;
  'created-at': number;
  'updated-at': number;
  'read-at': number | null;
  read: boolean;
  'dismissed-at': number | null;
  dismissed: boolean;
};

export type ChatPathMetadata = {
  title: string;
  description?: string;
  image?: string;
  creator: string;
  timestamp: string;
  reactions?: string;
  peer?: string; // if type is dm, this is the peer
};

export type ChatPathType = 'dm' | 'group' | 'space';
