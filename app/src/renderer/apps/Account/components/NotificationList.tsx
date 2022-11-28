import { FC } from 'react';
import styled from 'styled-components';

import InfiniteScroll from 'react-infinite-scroll-component';
import { Flex, Text } from 'renderer/components';
import { Notification } from './Notification';
import { useTrayApps } from 'renderer/apps/store';

interface INotificationList {
  unseen: any[];
  seen: any[];
}

const Log = styled(Flex)`
  ::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

export const NotificationList: FC<INotificationList> = (
  props: INotificationList
) => {
  const { unseen, seen } = props;
  // const merged = [...unseen, seen];
  // const pageSize = 20;
  // const [listEnd, setListEnd] = useState(false);
  // const [currentPage, setCurrentPage] = useState(0);

  // const [all, setAll] = useState<any[]>(seen);
  // const [chunk, setChunk] = useState<any[]>([]);
  const { dimensions } = useTrayApps();

  // useEffect(() => {
  //   if (all.length > pageSize) {
  //     const pageStart = currentPage * pageSize;
  //     let pageEnd = pageStart + pageSize;
  //     if (pageEnd > all.length) {
  //       pageEnd = all.length;
  //     }
  //     setChunk(all.slice(pageStart, pageEnd));
  //   } else {
  //     setChunk(all);
  //     setListEnd(true);
  //   }
  //   setAll(all);
  // }, [seen.length]);

  // console.log(listEnd, currentPage, all.length, chunk.length);
  // const onMore = () => {
  //   console.log('onmore');
  //   const newCurrentPage = currentPage + 1;
  //   const pageStart = newCurrentPage * pageSize;
  //   let pageLeftSize = pageSize;
  //   if (pageStart + pageSize > all.length) {
  //     pageLeftSize = all.length - newCurrentPage * pageSize;
  //   }

  //   let pageEnd = pageStart + pageLeftSize;
  //   if (pageEnd >= all.length) {
  //     pageEnd = all.length;
  //     setListEnd(true);
  //   }

  //   setCurrentPage(newCurrentPage);
  //   setChunk(chunk.concat(all.slice(pageStart, pageEnd)));
  // };

  return (
    <Log
      id="scrollableDiv"
      padding="0 14px"
      position="relative"
      overflowY="auto"
      flexDirection="column"
      height={dimensions.height}
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
      <InfiniteScroll
        dataLength={seen.length}
        next={() => {}}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }} // To put endMessage and loader to the top.
        // hasMore={!listEnd}
        hasMore={true}
        loader={<div>Loading</div>}
        scrollableTarget="scrollableDiv"
      >
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
    </Log>
  );
};
