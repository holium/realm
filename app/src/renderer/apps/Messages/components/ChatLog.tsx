import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import { toJS } from 'mobx';
import { ChatMessage } from './ChatMessage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, IconButton, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { WindowedList } from '@holium/design-system';

interface ChatLogProps {
  loading: boolean;
  isGroup: boolean;
  messages: GraphDMType[];
}

const reduceToPending = (arr: GraphDMType[]) => {
  return arr.map((val: GraphDMType) => val.pending);
};

export const ChatLog = observer((props: ChatLogProps) => {
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

  // todo better render prevention
  const isUpdated = isEqual(reduceToPending(all), reduceToPending(current));

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
    setAll(all);
    setCurrent(messages);
  }, [messages.length, isUpdated]);

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
        startAtBottom
        scrollToBottomOnChange
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
          >
            <Icons name="ArrowDown" />
          </IconButton>
        </Flex>
      )}
    </Flex>
  );
});
