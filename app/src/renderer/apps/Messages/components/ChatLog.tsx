import { FC, useRef, useEffect, useState, memo } from 'react';
import styled from 'styled-components';
import ScrollView from 'react-inverted-scrollview';
import { isEqual } from 'lodash';
import { toJS } from 'mobx';
import { ChatMessage } from './ChatMessage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, IconButton, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import InfiniteScroll from 'react-infinite-scroll-component';

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

const reduceToPending = (arr: GraphDMType[]) => {
  return arr.map((val: GraphDMType) => val.pending);
};

export const ChatLog: FC<ChatLogProps> = observer((props: ChatLogProps) => {
  const { loading, messages, isGroup } = props;
  const { dimensions } = useTrayApps();
  const { ship, theme } = useServices();
  const pageSize = 20;
  const [listEnd, setListEnd] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [all, setAll] = useState<GraphDMType[]>(toJS(messages));
  const [current, setCurrent] = useState<GraphDMType[]>(messages);
  const [chunk, setChunk] = useState<GraphDMType[]>([]);
  const { inputColor, iconColor, dockColor, textColor, windowColor, mode } =
    theme.currentTheme;
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  // console.log(reduceToPending(messages), reduceToPending(current));

  // todo better render prevention
  const isUpdated = isEqual(reduceToPending(all), reduceToPending(current));

  let scrollView = useRef<any>(null);
  useEffect(() => {
    const all = toJS(messages);
    if (all.length > pageSize) {
      const pageStart = currentPage * pageSize;
      let pageEnd = pageStart + pageSize;
      if (pageEnd > all.length) {
        pageEnd = all.length;
      }
      setChunk(all.slice(pageStart, pageEnd));
    } else {
      setChunk(all);
      setListEnd(true);
    }
    setCurrent(messages);
    setAll(all);
  }, [messages.length, isUpdated]);

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

  const onMore = () => {
    const newCurrentPage = currentPage + 1;
    const pageStart = newCurrentPage * pageSize;
    let pageLeftSize = pageSize;
    if (pageStart + pageSize > all.length) {
      pageLeftSize = all.length - newCurrentPage * pageSize;
    }

    let pageEnd = pageStart + pageLeftSize;
    if (pageEnd >= all.length) {
      pageEnd = all.length;
      setListEnd(true);
    }

    setCurrentPage(newCurrentPage);
    setChunk(chunk.concat(all.slice(pageStart, pageEnd)));
  };

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

  const scrollToBottom = () => {
    if (!scrollView) return;
    scrollView.current.scrollToBottom();
  };

  useEffect(() => {
    scrollView.current?.scrollToBottom();
  }, [scrollView]);

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
    <Log
      id="scrollableDiv"
      gap={2}
      height={dimensions.height}
      width="100%"
      position="relative"
      overflowY="auto"
      alignContent="center"
      flexDirection="column-reverse"
    >
      <InfiniteScroll
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
      </InfiniteScroll>

      {/*Put the scroll bar always on the bottom*/}

      {showJumpBtn && (
        <Flex position="absolute" bottom={64} right={12}>
          {/* TODO make a circle bg for this */}
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
            onClick={scrollToBottom}
          >
            <Icons name="ArrowDown" />
          </IconButton>
        </Flex>
      )}
    </Log>
  );
});
