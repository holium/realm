import { FC, useRef, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FixedSizeList as List } from 'react-window';
import { rgba, darken } from 'polished';
import { toJS } from 'mobx';

import { Flex, Text, PersonRow } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { ShipActions } from 'renderer/logic/actions/ship';

interface IFriendsList {
  friends: any[];
}

export const FriendsList: FC<IFriendsList> = observer((props: IFriendsList) => {
  const { friends } = props;
  const { theme, ship, contacts } = useServices();

  const { textColor, windowColor } = theme.currentTheme;

  const rowBg = rgba(darken(0.075, windowColor), 0.5);

  const pinned = useMemo(
    () => friends.filter((friend: any) => friend.pinned),
    [friends && friends.filter((friend: any) => friend.pinned).length]
  );

  const mutual = useMemo(
    () => friends.filter((friend: any) => friend.mutual),
    [friends && friends.filter((friend: any) => friend.pinned).length]
  );

  const all = useMemo(
    () => friends.filter((friend: any) => !friend.pinned),
    [friends && friends.filter((friend: any) => !friend.pinned).length]
  );

  const onUnpin = (person: any) => {
    ShipActions.editFriend(person.patp, {
      pinned: false,
      tags: person.tags,
    });
  };

  const onPin = (person: any) => {
    ShipActions.editFriend(person.patp, {
      pinned: true,
      tags: person.tags,
    });
  };

  const RowRenderer = (
    { index, style }: { index: number; style: any },
    usePinnedList: boolean
  ) => {
    const person = usePinnedList ? pinned[index] : all[index];
    let pinOption = [
      {
        label: 'Unpin',
        onClick: (_evt: any) => {
          onUnpin(person);
        },
      },
    ];
    if (!usePinnedList) {
      pinOption = [
        {
          label: 'Pin',
          onClick: (_evt: any) => {
            onPin(person);
          },
        },
      ];
    }

    const contact = contacts.getContactAvatarMetadata(person.patp);

    return (
      <PersonRow
        patp={person.patp}
        nickname={contact.nickname || person.nickname}
        sigilColor={contact.color || person.color}
        avatar={contact.avatar || person.avatar}
        description={contact.bio || person.description}
        listId="member-list"
        rowBg={rowBg}
        style={{ ...style }}
        theme={{
          textColor,
          windowColor,
        }}
        contextMenuOptions={[
          ...pinOption,
          {
            label: 'Remove',
            onClick: (_evt: any) => {
              ShipActions.removeFriend(person.patp);
            },
          },
        ]}
      />
    );
  };

  //
  const showHint =
    friends.length === 0 || (pinned.length > 0 && all.length === 0);

  return useMemo(
    () => (
      <>
        <Flex
          mt={18}
          height={pinned.length === 0 ? 60 : 24 + pinned.length * 42}
          flexDirection="column"
        >
          <Text
            style={{ textTransform: 'uppercase' }}
            fontSize={1}
            fontWeight={600}
            opacity={0.6}
            ml="2px"
            mb="4px"
          >
            Pinned
          </Text>
          {pinned.length === 0 && (
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height={40}
            >
              <Text fontSize={2} opacity={0.5}>
                {friends.length === 0
                  ? 'No friends to pin'
                  : 'No friends pinned'}
              </Text>
            </Flex>
          )}
          <List
            height={40}
            width="100%"
            itemSize={40}
            itemCount={pinned.length}
          >
            {(pinProps: { index: number; style: any }) =>
              RowRenderer(pinProps, true)
            }
          </List>
        </Flex>
        <Flex mt={18} height={24 + all.length * 42} flexDirection="column">
          <Text
            style={{ textTransform: 'uppercase' }}
            fontSize={1}
            fontWeight={600}
            opacity={0.6}
            ml="2px"
            mb="4px"
          >
            All
          </Text>
          {showHint && (
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height={40}
            >
              <Text fontSize={2} opacity={0.5}>
                {pinned.length > 0 &&
                  all.length === 0 &&
                  'All your friends are pinned'}
                {friends.length === 0 && 'Add some friends above'}
              </Text>
            </Flex>
          )}
          <List height={40} width="100%" itemSize={40} itemCount={all.length}>
            {(pinProps: { index: number; style: any }) =>
              RowRenderer(pinProps, false)
            }
          </List>
        </Flex>
      </>
    ),
    [pinned.length, friends.length, all.length]
  );
});
