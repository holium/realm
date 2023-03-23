import { Flex, BoxProps, Text } from '../../';
import { NotificationType } from './Notifications.types';
// import { WindowedList } from '../../';
import { AppGroup } from './AppGroup';
import { Notification } from './Notification';

type NotificationListProps = {
  settings?: {
    [app: string]: {
      groupByPath?: boolean;
    };
  };
  containerWidth: number;
  notifications: NotificationType[];
  appLookup: (app: string) => { name: string; image: string; key: string };
  onDismiss: (app: string, path: string, id: number) => void;
  onDismissAll: (app: string, path?: string) => void;
  onLinkClick: (app: string, path: string, link?: string) => void;
} & BoxProps;

export const NotificationList = ({
  containerWidth,
  notifications,
  justifyContent = 'flex-start',
  appLookup,
  onDismiss,
  onDismissAll,
  onLinkClick,
}: NotificationListProps) => {
  let apps = notifications.map((n) => n.app);
  // reduce notifications to unique paths
  apps = apps.filter((app, index) => apps.indexOf(app) === index);
  let appGroupedNotifications = apps.map((app) => {
    let grouped = notifications.filter((n) => n.app === app);
    return grouped;
  });
  if (notifications.length === 0) {
    return (
      // show empty state
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flex={1}
      >
        <Text.Custom fontSize={2} opacity={0.5}>
          No notifications
        </Text.Custom>
      </Flex>
    );
  }
  return (
    <Flex flexDirection="column" gap={8} justifyContent={justifyContent}>
      {appGroupedNotifications.map((appNotifs) => {
        const appInfo = appLookup(appNotifs[0].app);
        if (appNotifs.length === 1) {
          return (
            <Notification
              key={`${appNotifs[0].app}-${appNotifs[0].path}-${appNotifs[0].id}`}
              appInfo={appInfo}
              containerWidth={containerWidth}
              notification={appNotifs[0]}
              onDismiss={onDismiss}
              onLinkClick={onLinkClick}
            />
          );
        }
        return (
          <AppGroup
            key={`${appNotifs[0].app}`}
            containerWidth={containerWidth}
            notifications={appNotifs}
            appInfo={appInfo}
            onDismiss={onDismiss}
            onDismissAll={onDismissAll}
            onLinkClick={onLinkClick}
          />
        );
      })}
    </Flex>
  );
};
