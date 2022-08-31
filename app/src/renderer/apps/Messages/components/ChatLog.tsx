import { FC, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import ScrollView from 'react-inverted-scrollview';
import { ChatMessage } from './ChatMessage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/logic/apps/store';
import { Flex, IconButton, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import InfiniteScroll from 'react-infinite-scroll-component';

interface ChatLogProps {
  loading: boolean;
  messages: GraphDMType[];
}

// TODO make our own scrollbar
const Log = styled(Flex)`
  ::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

export const ChatLog: FC<ChatLogProps> = observer((props: ChatLogProps) => {
  const { loading, messages } = props;
  const { dimensions } = useTrayApps();
  const { ship, desktop } = useServices();
  const { inputColor, iconColor, dockColor, textColor, windowColor, mode } =
    desktop.theme;
  const [showJumpBtn, setShowJumpBtn] = useState(false);

  let scrollView = useRef<any>(null);

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
        dataLength={messages.length}
        next={() => {
          console.log('load more');
        }}
        style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
        inverse={true} //
        hasMore={true}
        loader={<div></div>}
        scrollableTarget="scrollableDiv"
      >
        <Flex style={{ height: 58 }} />
        {messages.map((message: any, index: number) => (
          <ChatMessage
            key={`${message.index}-${message.timeSent}-${index}`}
            theme={desktop.theme}
            our={ship!.patp}
            ourColor={ship!.color || '#569BE2'}
            message={message}
          />
          // <div key={index}>div - #{index}</div>
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
