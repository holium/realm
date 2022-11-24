import { useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, IconButton, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { useWindowedListRefs, WindowedList } from '@holium/design-system';

interface ChatLogProps {
  loading: boolean;
  isGroup: boolean;
  messages: GraphDMType[];
}

export const ChatLog = observer((props: ChatLogProps) => {
  const { loading, messages, isGroup } = props;
  const { innerRef, outerRef } = useWindowedListRefs();
  const { dimensions } = useTrayApps();
  const { ship, theme } = useServices();

  const { iconColor, dockColor, windowColor } = theme.currentTheme;
  const [showJumpBtn, setShowJumpBtn] = useState(false);

  const isBlank = !loading && messages.length === 0;

  if (isBlank) {
    return (
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
    );
  }

  return (
    <Flex
      height={dimensions.height}
      width="100%"
      position="relative"
      overflowY="auto"
      alignContent="center"
      flexDirection="column-reverse"
      paddingY={60}
    >
      <WindowedList
        data={messages}
        sort={(a, b) => a.timeSent - b.timeSent}
        renderRowElement={(message, index) => (
          <ChatMessage
            isSending={message.pending}
            showAuthor={isGroup}
            key={`${message.index}-${message.timeSent}-${index}`}
            theme={theme.currentTheme}
            author={message.author}
            primaryBubble={ship!.patp === message.author}
            ourColor={ship!.color || '#569BE2'}
            contents={message.contents}
            timeSent={message.timeSent}
          />
        )}
        innerRef={innerRef}
        outerRef={outerRef}
        scrollToBottomOnUpdate
        onScroll={() => {
          const isCloseToBottom =
            outerRef?.current &&
            outerRef.current.scrollHeight - outerRef.current.scrollTop <=
              outerRef.current.clientHeight + 100;
          isCloseToBottom ? setShowJumpBtn(false) : setShowJumpBtn(true);
        }}
      />

      {/* Put the scroll bar always on the bottom */}

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
            onClick={() => {
              outerRef?.current?.scrollTo({
                top: innerRef?.current?.scrollHeight,
                behavior: 'smooth',
              });
            }}
          >
            <Icons name="ArrowDown" />
          </IconButton>
        </Flex>
      )}
    </Flex>
  );
});
