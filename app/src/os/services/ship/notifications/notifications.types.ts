export type DbChangeType = 'del-row' | 'add-row' | 'update-row' | 'update-all';

export type AddRow = {
  type: 'add-row';
  row: NotificationsRow;
};

export type UpdateRow = {
  type: 'update-row';
  row: NotificationsRow;
};

export type UpdateAll = {
  type: 'update-all';
  read: boolean;
};

export type DelRow = {
  type: 'del-row';
  id: number;
};

export type NotifDbOps = AddRow | DelRow | UpdateAll | UpdateRow;

export type NotifDbChangeReactions = NotifDbOps[];

export type NotifDbReactions = NotificationsRow[] | NotifDbChangeReactions;

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
