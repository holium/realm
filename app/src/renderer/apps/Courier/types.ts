export type ChatRowType = {
  id: string;
  path: string;
  sender: string;
  peers: string[];
  metadata: any;
  lastMessage: any[];
  timestamp: number;
};

export type ContactMetadata = {
  patp: string;
  color: string;
  avatar?: string;
  nickname?: string;
  bio?: string;
};

export type ContactMap = {
  [key: string]: ContactMetadata;
};
