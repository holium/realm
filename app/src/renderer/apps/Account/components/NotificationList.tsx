import { FC } from 'react';
import { Flex } from 'renderer/components';
import { Notification } from './Notification';

interface INotificationList {
  notifications: any[];
}

export const NotificationList: FC<INotificationList> = (
  props: INotificationList
) => {
  const { notifications } = props;
  return (
    <Flex mt={1} flex={1} pr={4} pl={4} gap={4} flexDirection="column">
      {notifications.map((notif: any, index: number) => (
        <Notification key={`unseen-${index}`} {...notif} />
      ))}
    </Flex>
  );
};
