export type PathsRow = {
  path: string;
  type: string;
  metadata: any;
};

export type MessagesRow = {
  path: string;
  sender: string;
  'msg-id': [string, string];
  'msg-part-id': number;
  content: {
    [key: string]: string;
  };
  'reply-to': string;
  metadata: any;
  'created-at': number;
  'updated-at': number;
  'expires-at': number;
};

// {
//     "metadata": {},
//     "reply-to": null,
//     "updated-at": 1677600965248,
//     "msg-part-id": 0,
//     "created-at": 1677600965248,
//     "path": "/realm-chat/0v4.jv13r.4ltb5.dhk4d.dm84n.et8ie",
//     "expires-at": 0,
//     "sender": "~novdus-fidlys-dozzod-hostyv",
//     "content": {
//         "plain": "come on"
//     },
//     "msg-id": [
//         "~2023.2.28..16.16.05..3f5f",
//         "~novdus-fidlys-dozzod-hostyv"
//     ]
// }

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

export type UpdateRow = {
  table: ChatTables;
  type: 'update';
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
  row: string;
};
export type DelMessagesRow = {
  table: ChatTables;
  type: 'del-messages-row';
  id: string;
};

export type ChatDbOps =
  | AddRow
  | DelPeersRow
  | DelPathsRow
  | DelMessagesRow
  | UpdateRow;

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
