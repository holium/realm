import { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Flex, Label, Text } from 'renderer/components';
import { Notification } from './Notification';

interface INotificationList {
  unseen: any[];
  seen: any[];
}

export const NotificationList: FC<INotificationList> = (
  props: INotificationList
) => {
  const { unseen, seen } = props;
  return (
    <InfiniteScroll
      dataLength={unseen.length + seen.length + 30}
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
      <Text ml={1} mb={2} fontSize={2} opacity={0.6}>
        Unseen
      </Text>
      {unseen.map((notif: any, index: number) => (
        <Notification key={`unseen-${index}`} {...notif} />
      ))}
      {unseen.length === 0 && (
        <Flex
          flex="0 0 60px"
          height={60}
          mb="20px"
          justifyContent="center"
          alignItems="center"
        >
          <Text opacity={0.3}>No unseen</Text>
        </Flex>
      )}
      <Text mt={2} ml={1} mb={2} fontSize={2} opacity={0.6}>
        Seen
      </Text>
      {seen.map((notif: any, index: number) => (
        <Notification key={`unseen-${index}`} {...notif} seen={true} />
      ))}
      {seen.length === 0 && (
        <Flex
          flex="0 0 60px"
          height={60}
          mb="20px"
          justifyContent="center"
          alignItems="center"
        >
          <Text opacity={0.3}>No notifications</Text>
        </Flex>
      )}
      <Flex flex="0 0 62px" />
    </InfiniteScroll>
  );
};
