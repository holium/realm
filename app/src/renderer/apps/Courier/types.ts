import { ChatPathType } from 'os/services/chat/chat.service';

export type ChatRowType = {
  id: string;
  path: string;
  sender: string;
  peers: string[];
  metadata: any;
  type: ChatPathType;
  lastMessage: any[];
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
