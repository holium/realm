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
