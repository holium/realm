import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import useVirtual from 'react-cool-virtual';

import { ChatMessage } from './ChatMessage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, IconButton, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';

interface ChatLogProps {
  loading: boolean;
  isGroup: boolean;
  messages: GraphDMType[];
}

// TODO make our own scrollbar
const Log = styled(Flex)`
  ::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

let isScrolling = false; // Used to prevent UX conflict

const reduceToPending = (arr: GraphDMType[]) => {
  return arr.map((val: GraphDMType) => val.pending);
};

export const ChatLog: FC<ChatLogProps> = observer((props: ChatLogProps) => {
  const { loading, messages, isGroup } = props;
  const { dimensions } = useTrayApps();
  const { ship, theme } = useServices();

  const [shouldSticky, setShouldSticky] = useState(true);
  console.log(messages.length);
  const { outerRef, innerRef, items, scrollToItem } = useVirtual({
    // Provide the number of messages
    itemCount: messages.length - 1,
    // You can speed up smooth scrolling
    itemSize: 60,
    scrollDuration: 50,
    onScroll: ({ userScroll }) => {
      // If the user scrolls and isn't automatically scrolling, cancel stick to bottom
      if (userScroll) setShouldSticky(false);
    },
  });

  useEffect(() => {
    // Automatically stick to bottom, using smooth scrolling for better UX
    if (shouldSticky) {
      isScrolling = true;
      scrollToItem({ index: messages.length - 1, smooth: true }, () => {
        isScrolling = false;
      });
    }
  }, [messages.length, shouldSticky, scrollToItem]);

  const { inputColor, iconColor, dockColor, textColor, windowColor, mode } =
    theme.currentTheme;

  // const pageSize = 20;
  // const [listEnd, setListEnd] = useState(false);
  // const [currentPage, setCurrentPage] = useState(0);

  // const [all, setAll] = useState<GraphDMType[]>(toJS(messages));
  // const [current, setCurrent] = useState<GraphDMType[]>(messages);
  // const [chunk, setChunk] = useState<GraphDMType[]>([]);
  // const [showJumpBtn, setShowJumpBtn] = useState(false);
  // console.log(reduceToPending(messages), reduceToPending(current));

  // todo better render prevention
  // const isUpdated = isEqual(reduceToPending(all), reduceToPending(current));

  // let scrollView = useRef<any>(null);
  // useEffect(() => {
  //   const all = toJS(messages);
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
  //   setCurrent(messages);
  //   setAll(all);
  // }, [messages.length, isUpdated]);

  // const pendings = memo(reduceToPending(messages));

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
  // }, [all]);

  // const onMore = () => {
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

  // const handleScroll = ({
  //   scrollTop,
  //   scrollBottom,
  // }: {
  //   scrollTop: any;
  //   scrollBottom: any;
  // }) => {
  //   if (scrollBottom > 200) {
  //     setShowJumpBtn(true);
  //   } else {
  //     setShowJumpBtn(false);
  //   }
  //   // console.log({ scrollTop, scrollBottom });
  // };

  // const scrollToBottom = () => {
  //   if (!scrollView) return;
  //   scrollView.current.scrollToBottom();
  // };

  // useEffect(() => {
  //   scrollView.current?.scrollToBottom();
  // }, [scrollView]);

  const isBlank = !loading && messages.length === 0;

  return isBlank ? (
    <Flex
      height={dimensions.height}
      width="100%"
      alignContent="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Text textAlign="center" opacity={0.3} fontSize={3}>
        No messages
      </Text>
    </Flex>
  ) : (
    <div
      // id="scrollableDiv"
      ref={outerRef}
      gap={2}
      style={{ width: '100%', height: dimensions.height, overflow: 'auto' }}
      // height={dimensions.height}
      // width="100%"
      // // position="relative"
      // overflowY="auto"
      // alignContent="center"
    >
      <div width="100%" ref={innerRef}>
        {items.map(({ index, measureRef }) => {
          if (!messages[index]) return;
          return (
            // Used to measure the unknown item size
            <div
              key={`${messages[index].index}-${messages[index].timeSent}-${index}`}
              ref={measureRef}
            >
              <ChatMessage
                isSending={messages[index].pending}
                showAuthor={isGroup}
                // key={`${messages[index].index}-${messages[index].timeSent}-${index}`}
                theme={theme.currentTheme}
                our={ship!.patp}
                ourColor={ship!.color || '#569BE2'}
                message={messages[index]}
              />
            </div>
          );
        })}
      </div>
      {/* <InfiniteScroll
        dataLength={chunk.length}
        next={onMore}
        style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
        inverse={true} //
        hasMore={!listEnd}
        loader={<div></div>}
        scrollableTarget="scrollableDiv"
      >
        <Flex style={{ height: 58 }} />
        {chunk.map((message: GraphDMType, index: number) => (
          <ChatMessage
            isSending={message.pending}
            showAuthor={isGroup}
            key={`${message.index}-${message.timeSent}-${index}`}
            theme={theme.currentTheme}
            our={ship!.patp}
            ourColor={ship!.color || '#569BE2'}
            message={message}
          />
        ))}
        <Flex style={{ height: 58 }} />
      </InfiniteScroll> */}

      {/* Put the scroll bar always on the bottom */}

      {!shouldSticky && (
        <Flex position="absolute" bottom={64} right={12}>
          <IconButton
            color={iconColor}
            customBg={dockColor}
            style={{
              borderRadius: 14,
              cursor: 'none',
              backdropFilter: 'blur(4px)',
              background: windowColor,
            }}
            size={28}
            onClick={(evt) => {
              evt.stopPropagation();
              setShouldSticky(true);
            }}
          >
            <Icons name="ArrowDown" />
          </IconButton>
        </Flex>
      )}
    </div>
  );
});
