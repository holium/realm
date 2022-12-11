import { FC, useMemo } from 'react';
import { Flex, Text } from 'renderer/components';
import { Notification, NotificationProps } from './Notification';
import { useTrayApps } from 'renderer/apps/store';
import { WindowedList } from '@holium/design-system';
import { NotificationModelType } from 'os/services/spaces/models/beacon';

interface INotificationList {
  unseen: NotificationModelType[];
  seen: NotificationModelType[];
}

export const NotificationList: FC<INotificationList> = ({
  unseen,
  seen,
}: INotificationList) => {
  const { dimensions } = useTrayApps();

  type ListData = {
    type: string;
    data: NotificationProps | string;
  };

  console.log(`unseen: ${unseen.length}, seen: ${seen.length}`);

  const listData: ListData[] = useMemo(
    () => [
      { type: 'title', data: 'Unseen' },
      ...(unseen.length === 0
        ? [{ type: 'hint', data: 'No notifications' }]
        : unseen.map((n: NotificationModelType) => ({
            type: 'notification',
            data: n,
          }))),
      { type: 'title', data: 'Seen' },
      ...(seen.length === 0
        ? [{ type: 'hint', data: 'No notifications' }]
        : seen.map((n: NotificationModelType) => ({
            type: 'notification',
            data: n,
          }))),
    ],
    [seen, seen.length, unseen, unseen.length]
  );

  return (
    <Flex
      padding="60px 14px"
      position="relative"
      flexDirection="column"
      height={dimensions.height}
    >
      <WindowedList
        width={370}
        data={listData}
        rowRenderer={(item, index) => {
          if (item.type === 'title') {
            const title = item.data as string;
            return (
              <Text py={2} ml={1} fontSize={2} opacity={0.6}>
                {title}
              </Text>
            );
          } else if (item.type === 'notification') {
            const notification = item.data as NotificationProps;
            return (
              <Notification key={`seen-${index}`} {...notification} seen />
            );
          } else {
            const hint = item.data as string;
            return (
              <Flex
                flex="0 0 60px"
                height={60}
                mb="20px"
                justifyContent="center"
                alignItems="center"
              >
                <Text opacity={0.3}>{hint}</Text>
              </Flex>
            );
          }
        }}
      />
    </Flex>
  );
};
