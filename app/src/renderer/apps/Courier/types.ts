export type ChatRowType = {
  id: string;
  path: string;
  sender: string;
  lastMessage: string;
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
