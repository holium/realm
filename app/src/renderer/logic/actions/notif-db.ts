import { NotificationService } from 'os/services/notification/notification.service';
type NotifDBActionType = typeof NotificationService.preload;
export const NotifDBActions: NotifDBActionType =
  window.electron.os.notification;
