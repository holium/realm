export type NotificationType = {
  id: number;
  app: string;
  path: string;
  type: 'app' | 'chat' | 'group' | 'invite' | 'message' | 'mention' | string;
  title: string;
  content?: string;
  image?: string;
  buttons?: NotificationButtonType[]; // NOTE: there should only be two buttons max
  link?: string;
  metadata?: string;
  pathMetadata?: string | any;
  createdAt: number;
  updatedAt: number;
  readAt: number | null;
  read: boolean;
  dismissedAt: number | null;
  dismissed: boolean;
};

export type NotificationButtonType = {
  label: string;
  path: string;
  data: string;
  metadata?: string;
};
