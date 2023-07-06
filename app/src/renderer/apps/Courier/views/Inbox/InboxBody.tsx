import { useCallback, useState } from 'react';

import { Button, Flex, Icon } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { ChatModelType } from 'renderer/stores/models/chat.model';

import { InboxBodyHeaderContainer } from './InboxBody.styles';
import { InboxBodyList } from './InboxBodyList';
import { InboxBodyLoadingHeader } from './InboxBodyLoadingHeader';

type Props = {
  inboxes: ChatModelType[];
  accountIdentity: string | undefined;
  spacePath: string | undefined;
  isLoading: boolean;
  isStandaloneChat?: boolean;
  isChatPinned: (path: string) => boolean;
  onClickInbox: (path: string) => void;
  onClickNewInbox: () => void;
  onClickStandaloneChat: () => void;
};

export const InboxBody = ({
  inboxes,
  accountIdentity,
  spacePath,
  isLoading,
  isStandaloneChat,
  isChatPinned,
  onClickInbox,
  onClickNewInbox,
  onClickStandaloneChat,
}: Props) => {
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
    <Flex width="100%" height="100%" minWidth={0} flexDirection="column">
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
      {isLoading && isStandaloneChat && <InboxBodyLoadingHeader />}
      <InboxBodyList
        inboxes={filteredInboxes}
        spacePath={spacePath}
        accountIdentity={accountIdentity}
        isStandaloneChat={Boolean(isStandaloneChat)}
        isEmpty={filteredInboxes.length === 0}
        isChatPinned={isChatPinned}
        onClickInbox={onClickInbox}
      />
    </Flex>
  );
};
