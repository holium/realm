import { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import {
  Button,
  Flex,
  Icon,
  Text,
  WindowedList,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { useTrayApps } from 'renderer/apps/store';
import { ChatModelType } from 'renderer/stores/models/chat.model';

import { InboxRow } from './InboxRow';

const InboxBodyHeaderContainer = styled(Flex)<{ isStandaloneChat?: boolean }>`
  align-items: center;
  z-index: 1;
  padding: 0 0 8px 4px;

  ${({ isStandaloneChat }) =>
    isStandaloneChat &&
    `
    height: 58px;
    padding: 12px
  `}
`;

type Props = {
  inboxes: ChatModelType[];
  accountIdentity: string | undefined;
  spacePath: string | undefined;
  isStandaloneChat?: boolean;
  isChatPinned: (path: string) => boolean;
  onClickInbox: (path: string) => void;
  onClickNewInbox: () => void;
  onClickStandaloneChat: () => void;
};

const InboxBodyPresenter = ({
  inboxes,
  accountIdentity,
  spacePath,
  isStandaloneChat,
  isChatPinned,
  onClickInbox,
  onClickNewInbox,
  onClickStandaloneChat,
}: Props) => {
  const { dimensions } = useTrayApps();

  const width = isStandaloneChat ? '100%' : dimensions.width - 24;
  const height = isStandaloneChat ? '100%' : dimensions.height - 24;

  const [searchString, setSearchString] = useState<string>('');

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
      width={width}
      height={height}
      minWidth={0}
      flexDirection="column"
      paddingLeft={isStandaloneChat ? 12 : 0}
    >
      <InboxBodyHeaderContainer isStandaloneChat={isStandaloneChat}>
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
            <Icon name="Window" size={24} opacity={0.5} />
          </Button.IconButton>
          <Button.IconButton
            className="realm-cursor-hover"
            size={26}
            onClick={(e) => {
              e.stopPropagation();
              onClickNewInbox();
            }}
          >
            <Icon name="Plus" size={24} opacity={0.5} />
          </Button.IconButton>
        </Flex>
      </InboxBodyHeaderContainer>
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
              key={`inbox-${inbox.path}-${index}`}
              inbox={inbox}
              isAdmin={accountIdentity ? inbox.isHost(accountIdentity) : false}
              isSelectedSpaceChat={inbox.metadata.space === spacePath}
              isPinned={isChatPinned(inbox.path)}
              isStandaloneChat={isStandaloneChat}
              onClickInbox={onClickInbox}
            />
          )}
        />
      )}
    </Flex>
  );
};

export const InboxBody = observer(InboxBodyPresenter);
