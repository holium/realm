import { NotifMobxType } from 'renderer/apps/Account/store';

export const QUERY_NOTIFICATIONS = `
  SELECT id,
      app,
      path,
      type,
      title,
      content,
      image,
      buttons,
      link,
      metadata,
      created_at   createdAt,
      updated_at   updatedAt,
      read_at      readAt,
      read,
      dismissed_at dismissedAt,
      dismissed
  FROM notifications
`;

export const convertRowToNotification = (row: any): NotifMobxType => {
  return {
    ...row,
    read: row.read === 1,
    dismissed: row.dismissed === 1,
    buttons: row.buttons ? JSON.parse(row.buttons) : null,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  };
};
