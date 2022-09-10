import { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
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
    <InfiniteScroll
      dataLength={notifications.length}
      next={() => {}}
      style={{
        display: 'flex',
        flexDirection: 'column',
        top: 0,
        bottom: 0,
        height: 450,
        padding: '0 12px',
      }} //To put endMessage and loader to the top.
      hasMore={false}
      loader={<div></div>}
      scrollableTarget="scrollableDiv"
    >
      <Flex flex="0 0 58px" />

      {notifications.map((notif: any, index: number) => (
        <Notification key={`unseen-${index}`} {...notif} />
      ))}
      <Flex flex="0 0 62px" />
    </InfiniteScroll>
  );
};
