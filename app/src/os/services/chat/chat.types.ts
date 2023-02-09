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

export type ChatDBReactions =
  | {
      tables: { messages: MessagesRow[]; paths: PathsRow[]; peers: PeersRow[] };
    }
  | {
      table: ChatTables;
      type: 'add-row';
      row: PathsRow[] | MessagesRow[] | PeersRow[];
    }
  | { table: ChatTables; type: 'del-peers-row'; path: string }
  | { table: ChatTables; type: 'del-paths-row'; path: string }
  | { table: ChatTables; type: 'del-messages-row'; id: string };
