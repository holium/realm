import { FC, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { rgba, darken } from 'polished';

import { Flex, Text, PersonRow } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { ShipActions } from 'renderer/logic/actions/ship';
import { FriendType } from 'os/services/ship/models/friends';

interface IFriendsList {
  friends: any[];
}

export const FriendsList: FC<IFriendsList> = observer((props: IFriendsList) => {
  const paneRef = useRef(null);
  const { theme, ship, contacts, friends } = useServices();
  const [height, setHeight] = useState(400);
  const { textColor, windowColor } = theme.currentTheme;
  const rowBg = rgba(darken(0.075, windowColor), 0.5);

  const pinned = friends.pinned || [];
  const all = friends.unpinned || [];

  useEffect(() => {
    let pinnedHeight = 15 + (pinned.length ? pinned.length * 38 : 60);
    let paneHeight = 400;

    if (paneRef.current) {
      paneHeight = (paneRef.current as HTMLDivElement).clientHeight - 33; // 33 is the height of the header
      setHeight(paneHeight - pinnedHeight);
    }
  }, [pinned, paneRef.current]);

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
    person: FriendType & { patp: string },
    index: number
  ) => {
    let pinOption = [
      {
        label: 'Unpin',
        onClick: (_evt: any) => {
          onUnpin(person);
        },
      },
    ];
    if (!person.pinned) {
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
        key={person.patp}
        patp={person.patp}
        nickname={contact.nickname}
        sigilColor={contact.color}
        avatar={contact.avatar}
        description={contact.bio}
        listId="member-list"
        rowBg={rowBg}
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
    friends.list.length === 0 || (pinned.length > 0 && all.length === 0);

  return (
    <Flex
      ref={paneRef}
      mt={18}
      height="calc(100% - 90px)"
      flexDirection="column"
      overflowY="hidden"
    >
      <Flex flexDirection="column">
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
            height={60}
          >
            <Text fontSize={2} opacity={0.5}>
              {friends.list.length === 0
                ? 'No friends to pin'
                : 'No friends pinned'}
            </Text>
          </Flex>
        )}
        {pinned.map((person, index) => RowRenderer(person, index))}
      </Flex>
      <Flex mt={18} flexDirection="column">
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
              {friends.list.length === 0 && 'Add some friends above'}
            </Text>
          </Flex>
        )}
        <Flex overflowY="auto" height={height} flexDirection="column">
          {all.map((person, index) => RowRenderer(person, index))}
        </Flex>
      </Flex>
    </Flex>
  );
});
