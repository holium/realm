import { useCallback, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  TextInput,
  WindowedList,
} from '@holium/design-system';

import { ChatModelType } from '../../../../stores/models/chat.model';
import { ChatRow } from '../../components/ChatRow';

const heightPadding = 12;
const searchHeight = 40;

type Props = {
  inboxes: ChatModelType[];
  width: number;
  height: number;
  accountIdentity: string | undefined;
  spacePath: string | undefined;
  isChatPinned: (path: string) => boolean;
  onClickInbox: (path: string) => void;
  onClickNewInbox: () => void;
  onClickStandaloneChat: () => void;
};

export const InboxView = ({
  inboxes,
  width,
  height,
  accountIdentity,
  spacePath,
  isChatPinned,
  onClickInbox,
  onClickNewInbox,
  onClickStandaloneChat,
}: Props) => {
  const [searchString, setSearchString] = useState<string>('');
  const [showList, setShowList] = useState<boolean>(false);

  const listWidth = useMemo(() => width - 2, [width]);
  const listHeight = useMemo(
    () => height + 24 - heightPadding - searchHeight,
    [height]
  );

  const searchFilter = useCallback(
    (inbox: ChatModelType) => {
      if (!searchString || searchString.trim() === '') return true;
      const dm = inbox as ChatModelType;
      const title = dm.metadata.title;
      return title.toLowerCase().indexOf(searchString.toLowerCase()) === 0;
    },
    [searchString]
  );

  const filteredInboxes = inboxes.filter(searchFilter);

  return (
    <Flex
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.01 }}
      width={width}
      height={height}
      flexDirection="column"
      onAnimationComplete={() => setShowList(true)}
    >
      <Flex zIndex={1} mb={2} ml={1} flexDirection="row" alignItems="center">
        <Flex width={26}>
          <Icon name="Messages" size={24} opacity={0.8} />
        </Flex>
        <Flex flex={1} pl={3} pr={2} alignItems="center">
          <TextInput
            id="dm-search"
            name="dm-search"
            width="100%"
            borderRadius={16}
            height={32}
            placeholder="Search"
            onChange={(evt) => {
              setSearchString((evt.target as HTMLInputElement).value);
            }}
          />
        </Flex>
        <Flex gap="4px">
          <Button.IconButton
            className="realm-cursor-hover"
            size={26}
            onClick={onClickStandaloneChat}
          >
            <Icon name="Link" size={24} opacity={0.5} />
          </Button.IconButton>
          <Button.IconButton
            className="realm-cursor-hover"
            size={26}
            onClick={onClickNewInbox}
          >
            <Icon name="Plus" size={24} opacity={0.5} />
          </Button.IconButton>
        </Flex>
      </Flex>
      {filteredInboxes.length === 0 ? (
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={8}
        >
          <Text.Custom
            width={200}
            fontSize={3}
            fontWeight={500}
            textAlign="center"
            opacity={0.5}
          >
            No chats yet.
          </Text.Custom>
          <Text.Custom
            width={200}
            fontSize={3}
            textAlign="center"
            opacity={0.3}
          >
            Click the <b>+</b> to start.
          </Text.Custom>
        </Flex>
      ) : (
        showList && (
          <Box height={height + 24 - heightPadding} width={listWidth}>
            <WindowedList
              data={filteredInboxes}
              width={listWidth}
              shiftScrollbar
              height={listHeight}
              overscan={25}
              increaseViewportBy={{
                top: 400,
                bottom: 400,
              }}
              itemContent={(index, inbox) => (
                <Inbox
                  key={`${window.ship}-${inbox.path}-${index}-unpinned`}
                  inbox={inbox}
                  isAdmin={
                    accountIdentity ? inbox.isHost(accountIdentity) : false
                  }
                  isLast={index === filteredInboxes.length - 1}
                  isSelectedSpaceChat={inbox.metadata.space === spacePath}
                  isPinned={isChatPinned(inbox.path)}
                  onClickInbox={onClickInbox}
                />
              )}
            />
          </Box>
        )
      )}
    </Flex>
  );
};

type InboxProps = {
  inbox: ChatModelType;
  isAdmin: boolean;
  isLast: boolean;
  isSelectedSpaceChat: boolean;
  isPinned: boolean;
  onClickInbox: (path: string) => void;
};

const Inbox = ({
  inbox,
  isAdmin,
  isLast,
  isSelectedSpaceChat,
  isPinned,
  onClickInbox,
}: InboxProps) => {
  const height = inbox.type === 'space' ? 70 : 52;

  let customStyle = {};
  let outerStyle = {};

  if (isSelectedSpaceChat) {
    outerStyle = {
      paddingBottom: 8,
      height: height + 8,
      marginBottom: 8,
      borderBottom: '1px solid rgba(var(--rlm-border-rgba), 0.8)',
    };
    customStyle = {
      borderRadius: 6,
    };
  } else if (isPinned) {
    outerStyle = {
      height,
    };
    customStyle = {
      borderRadius: 6,
      height,
      background: 'var(--rlm-overlay-hover-color)',
    };
  } else if (isLast) {
    outerStyle = {
      height: height + 16,
      paddingBottom: 16,
    };
  } else {
    outerStyle = {
      height,
    };
  }

  return (
    <Box style={outerStyle}>
      <Box
        width="100%"
        zIndex={2}
        layout="preserve-aspect"
        alignItems="center"
        layoutId={`chat-${inbox.path}-container`}
        style={customStyle}
      >
        <ChatRow
          height={height}
          path={inbox.path}
          title={inbox.metadata.title}
          peers={inbox.peers.map((peer) => peer.ship)}
          isAdmin={isAdmin}
          type={inbox.type}
          timestamp={inbox.createdAt || inbox.metadata.timestamp}
          metadata={inbox.metadata}
          peersGetBacklog={inbox.peersGetBacklog}
          muted={inbox.muted}
          onClick={(evt) => {
            evt.stopPropagation();
            onClickInbox(inbox.path);
          }}
        />
      </Box>
    </Box>
  );
};
