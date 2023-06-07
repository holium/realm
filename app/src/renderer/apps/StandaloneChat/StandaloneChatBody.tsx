import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Flex, Spinner, Text } from '@holium/design-system/general';

import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInfo } from '../Courier/views/ChatInfo';
import { ChatLog } from '../Courier/views/ChatLog/ChatLog';
import { Inbox } from '../Courier/views/Inbox/Inbox';
import { NewChat } from '../Courier/views/NewChat';

const ResizeHandle = styled.div`
  width: 5px;
  height: 100%;
  cursor: col-resize;
`;

export const StandaloneChatBodyPresenter = () => {
  const { chatStore } = useShipStore();

  const [sidebarWidth, setSidebarWidth] = useState(400);

  useEffect(() => {
    // Fetch messages for the selected chat.
    if (chatStore.subroute === 'inbox') {
      if (chatStore.inbox.length === 0) {
        chatStore.loadChatList();
      }
    } else {
      chatStore.selectedChat?.fetchMessages();
    }
  }, [chatStore.subroute, chatStore.selectedChat, chatStore.inbox]);

  if (chatStore.loader.isFirstLoad) {
    return (
      <Flex
        position="absolute"
        flexDirection="column"
        justify="center"
        align="center"
        gap={12}
        left={0}
        right={0}
        top={0}
        bottom={0}
      >
        <Spinner size={1} />
        <Text.Hint opacity={0.4}>
          Fetching initial data from {window.ship}
        </Text.Hint>
      </Flex>
    );
  }

  return (
    <Flex
      style={{
        width: '100%',
        height: '100%',
        paddingTop: 28,
        background: 'var(--rlm-dock-color)',
      }}
    >
      <Flex
        minWidth={300}
        width={sidebarWidth}
        borderRight="1px solid var(--rlm-dock-color)"
        background="var(--rlm-base-color)"
      >
        <Inbox isStandaloneChat />
        <ResizeHandle
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.pageX;
            const startWidth = sidebarWidth;

            const onMouseMove = (e: MouseEvent) => {
              const delta = e.pageX - startX;
              setSidebarWidth(startWidth + delta);
            };

            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        />
      </Flex>
      <Flex flex={1} height="100%" position="relative" minWidth={360}>
        {chatStore.subroute === 'chat' && <ChatLog isStandaloneChat />}
        {chatStore.subroute === 'chat-info' && <ChatInfo />}
        {chatStore.subroute === 'new' && <NewChat />}
      </Flex>
    </Flex>
  );
};

export const StandaloneChatBody = observer(StandaloneChatBodyPresenter);
