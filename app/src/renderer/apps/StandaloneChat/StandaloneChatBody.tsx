import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Spinner, Text } from '@holium/design-system/general';

import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInfo } from '../Courier/views/ChatInfo';
import { ChatLog } from '../Courier/views/ChatLog/ChatLog';
import { Inbox } from '../Courier/views/Inbox/Inbox';
import { NewChat } from '../Courier/views/NewChat';
import {
  ResizeHandle,
  StandaloneChatContainer,
} from './StandaloneChatBody.styles';

export const StandaloneChatBodyPresenter = () => {
  const { chatStore } = useShipStore();

  const [sidebarWidth, setSidebarWidth] = useState(400);

  const onMouseDownResizeHandle = (e: React.MouseEvent) => {
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
  };

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
    <StandaloneChatContainer>
      <Flex
        position="relative"
        minWidth={320}
        width={sidebarWidth}
        background="var(--rlm-base-color)"
        borderRight="1px solid var(--rlm-dock-color)"
      >
        <Inbox isStandaloneChat />
        <ResizeHandle onMouseDown={onMouseDownResizeHandle} />
      </Flex>
      <Flex flex={1} height="100%" position="relative" minWidth={360}>
        {chatStore.subroute === 'chat' && <ChatLog isStandaloneChat />}
        {chatStore.subroute === 'chat-info' && <ChatInfo />}
        {chatStore.subroute === 'new' && <NewChat />}
      </Flex>
    </StandaloneChatContainer>
  );
};

export const StandaloneChatBody = observer(StandaloneChatBodyPresenter);
