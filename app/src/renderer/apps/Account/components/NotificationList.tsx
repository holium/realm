import { useMemo } from 'react';
import { Flex, Text } from 'renderer/components';
import { Notification } from './Notification';
import { useTrayApps } from 'renderer/apps/store';
import { WindowedList } from '@holium/design-system';
import { NotificationModelType } from 'os/services/spaces/models/beacon';
import { observer } from 'mobx-react';

interface INotificationList {
  unseen: NotificationModelType[];
  seen: NotificationModelType[];
}

const NotificationListPresenter = ({ unseen, seen }: INotificationList) => {
  const { dimensions } = useTrayApps();

  const listData = useMemo(
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
      pt={40}
      pb={70}
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
            const notification = item.data as NotificationModelType;
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

export const NotificationList = observer(NotificationListPresenter);
