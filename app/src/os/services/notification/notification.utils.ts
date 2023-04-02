import { NotifMobxType } from 'renderer/stores/ship.store';

export const QUERY_NOTIFICATIONS = `
  SELECT id,
    app,
    notifications.path,
    notifications.type,
    title,
    content,
    image,
    buttons,
    link,
    notifications.metadata,
    paths.metadata pathMetadata,
    notifications.created_at   createdAt,
    notifications.updated_at   updatedAt,
    read_at      readAt,
    read,
    dismissed_at dismissedAt,
    dismissed
  FROM notifications 
  LEFT OUTER JOIN paths ON notifications.path = paths.path
`;

export const convertRowToNotification = (row: any): NotifMobxType => {
  return {
    ...row,
    read: row.read === 1,
    dismissed: row.dismissed === 1,
    buttons: row.buttons ? JSON.parse(row.buttons) : null,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    pathMetadata: row.pathMetadata ? JSON.parse(row.pathMetadata) : null,
  };
};
