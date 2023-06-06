import { useCallback, useState } from 'react';

import {
  Button,
  Flex,
  Icon,
  Text,
  WindowedList,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { ChatModelType } from 'renderer/stores/models/chat.model';

import { InboxRow } from './InboxRow';

type Props = {
  inboxes: ChatModelType[];
  width: number | undefined;
  height: number | undefined;
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
      width={width ?? '100%'}
      height={height ?? '100%'}
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
          <WindowedList
            data={filteredInboxes}
            shiftScrollbar
            overscan={25}
            increaseViewportBy={{
              top: 400,
              bottom: 400,
            }}
            itemContent={(index, inbox) => (
              <InboxRow
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
        )
      )}
    </Flex>
  );
};
