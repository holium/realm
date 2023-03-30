import { ChatPathType } from 'os/services/chat/chat.service';

export type ChatRowType = {
  id: string;
  path: string;
  sender: string;
  peers: string[];
  metadata: any;
  type: ChatPathType;
  lastMessage: any[];
  peersGetBacklog: boolean;
  createdAt: number;
  updatedAt: number;
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

export const expiresInMap = {
  off: null,
  '10-mins': 10 * 60 * 1000,
  '1-hour': 60 * 60 * 1000,
  '12-hours': 12 * 60 * 60 * 1000,
  '1-day': 24 * 60 * 60 * 1000,
  '1-week': 7 * 24 * 60 * 60 * 1000,
  '1-month': 30 * 24 * 60 * 60 * 1000,
};

export type ExpiresValue = keyof typeof expiresInMap;

export const millisecondsToExpires = (ms: number) => {
  const keys = Object.keys(expiresInMap) as Array<ExpiresValue>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (expiresInMap[key] === ms) {
      return key;
    }
  }
  return 'off';
};
