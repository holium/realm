export type PathsRow = {
  path: string;
  type: string;
  metadata: any;
};

export type MessagesRow = {
  path: string;
  'msg-id': [string, string];
  'msg-part-id': number;
  content: {
    [key: string]: string;
  };
  'reply-to': string;
  metadata: any;
  timestamp: string;
  sender: string;
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
  | 'add-row';

export type AddRow = {
  table: ChatTables;
  type: 'add-row';
  row: PathsRow | MessagesRow | PeersRow;
};

export type DelPeersRow = {
  table: ChatTables;
  type: 'del-peers-row';
  path: string;
};
export type DelPathsRow = {
  table: ChatTables;
  type: 'del-paths-row';
  path: string;
};
export type DelMessagesRow = {
  table: ChatTables;
  type: 'del-messages-row';
  id: string;
};

export type ChatDbOps = AddRow | DelPeersRow | DelPathsRow | DelMessagesRow;

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
