import { useMemo, useRef } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import { Flex, Text, PersonRow } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { ShipActions } from 'renderer/logic/actions/ship';
import { FriendType } from 'os/services/ship/models/friends';
import { WindowedList } from '@holium/design-system';

const FriendsListPresenter = () => {
  const paneRef = useRef(null);
  const { theme, friends } = useServices();
  const rowBg = rgba(darken(0.075, theme.currentTheme.windowColor), 0.5);

  const pinned = useMemo(() => friends.pinned || [], [friends.pinned]);
  const unpinned = useMemo(() => friends.unpinned || [], [friends.unpinned]);

  type ListData = {
    type: string;
    data: any;
  };

  const listData: ListData[] = useMemo(
    () => [
      { type: 'title', data: 'Pinned' },
      ...(pinned.length === 0
        ? friends.list.length === 0
          ? [{ type: 'hint', data: 'No friends to pin' }]
          : [{ type: 'hint', data: 'No pinned friends' }]
        : pinned.map((n) => ({ type: 'friend', data: n }))),
      { type: 'title', data: 'All' },
      ...(unpinned.length === 0
        ? pinned.length > 0
          ? [{ type: 'hint', data: 'All your friends are pinned' }]
          : [{ type: 'hint', data: 'Add some friends above' }]
        : unpinned.map((n) => ({ type: 'friend', data: n }))),
    ],
    [friends.list.length, pinned, unpinned]
  );

  const onUnpin = (friend: any) => {
    ShipActions.editFriend(friend.patp, {
      pinned: false,
      tags: friend.tags,
    });
  };

  const onPin = (friend: any) => {
    ShipActions.editFriend(friend.patp, {
      pinned: true,
      tags: friend.tags,
    });
  };

  const TitleRow = ({ title }: { title: string }) => (
    <Text
      key={title}
      pt={23}
      style={{ textTransform: 'uppercase' }}
      fontSize={1}
      fontWeight={600}
      opacity={0.6}
      ml="2px"
      mb="4px"
    >
      {title}
    </Text>
  );

  const HintRow = ({ hint }: { hint: string }) => (
    <Flex
      key={hint}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height={60}
    >
      <Text fontSize={2} opacity={0.5}>
        {hint}
      </Text>
    </Flex>
  );

  const FriendRow = ({ friend }: { friend: FriendType & { patp: string } }) => {
    const contact = friends.getContactAvatarMetadata(friend.patp);
    const pinOption = [
      {
        label: friend.pinned ? 'Unpin' : 'Pin',
        onClick: (_evt: any) => {
          friend.pinned ? onUnpin(friend) : onPin(friend);
        },
      },
    ];

    return (
      <PersonRow
        key={friend.patp}
        patp={friend.patp}
        nickname={contact.nickname}
        sigilColor={contact.color}
        avatar={contact.avatar}
        description={contact.bio}
        listId="friend-list"
        rowBg={rowBg}
        theme={theme.currentTheme}
        contextMenuOptions={[
          ...pinOption,
          {
            label: 'Remove',
            onClick: (_evt: any) => {
              ShipActions.removeFriend(friend.patp);
            },
          },
        ]}
      />
    );
  };

  return (
    <Flex
      ref={paneRef}
      mb={18}
      height="calc(100% - 90px)"
      flexDirection="column"
      overflowY="hidden"
    >
      <Flex flexDirection="column" flex={1}>
        <WindowedList
          width={298}
          data={listData}
          itemContent={(_, rowData) => {
            if (rowData.type === 'friend') {
              const friend = rowData.data;
              return <FriendRow friend={friend} />;
            } else if (rowData.type === 'title') {
              const title = rowData.data;
              return <TitleRow title={title} />;
            } else {
              const hint = rowData.data;
              return <HintRow hint={hint} />;
            }
          }}
        />
      </Flex>
    </Flex>
  );
};

export const FriendsList = observer(FriendsListPresenter);
