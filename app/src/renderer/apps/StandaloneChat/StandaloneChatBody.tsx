import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Spinner, Text } from '@holium/design-system/general';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInfo } from '../Courier/views/ChatInfo/ChatInfo';
import { ChatLog } from '../Courier/views/ChatLog/ChatLog';
import { CreateNewChat } from '../Courier/views/CreateNewChat/CreateNewChat';
import { Inbox } from '../Courier/views/Inbox/Inbox';
import {
  ResizeHandle,
  StandaloneChatContainer,
} from './StandaloneChatBody.styles';
import { StandaloneChatPassport } from './StandaloneChatPassport';
import { StandaloneChatPassportPreview } from './StandaloneChatPassportPreview';

export const StandaloneChatBodyPresenter = () => {
  const { showTitleBar } = useAppState();
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
    <StandaloneChatContainer showTitleBar={showTitleBar}>
      <Flex
        flexDirection="column"
        minWidth={320}
        width={sidebarWidth}
        background="var(--rlm-window-color)"
        borderRight="1px solid var(--rlm-base-color)"
      >
        <Flex flex={1} position="relative">
          <Inbox isStandaloneChat />
          <ResizeHandle onMouseDown={onMouseDownResizeHandle} />
        </Flex>
        <StandaloneChatPassportPreview
          onClickCog={() => {
            chatStore.setChat('');
            chatStore.setSubroute('passport');
          }}
        />
      </Flex>
      <Flex
        flex={1}
        height="100%"
        position="relative"
        minWidth={360}
        background="var(--rlm-dock-color)"
      >
        {chatStore.subroute === 'chat' && <ChatLog isStandaloneChat />}
        {chatStore.subroute === 'chat-info' && <ChatInfo isStandaloneChat />}
        {chatStore.subroute === 'new' && <CreateNewChat isStandaloneChat />}
        {chatStore.subroute === 'passport' && (
          <StandaloneChatPassport
            onBack={() => chatStore.setSubroute('inbox')}
          />
        )}
      </Flex>
    </StandaloneChatContainer>
  );
};

export const StandaloneChatBody = observer(StandaloneChatBodyPresenter);
