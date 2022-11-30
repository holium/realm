import { FC, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';

import { Flex, Text, PersonRow } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { ShipActions } from 'renderer/logic/actions/ship';
import { FriendType } from 'os/services/ship/models/friends';
import { WindowedList } from '@holium/design-system';

interface IFriendsList {
  friends: any[];
}

export const FriendsList: FC<IFriendsList> = observer((props: IFriendsList) => {
  const paneRef = useRef(null);
  const { theme, contacts, friends } = useServices();
  const { textColor, windowColor } = theme.currentTheme;
  const rowBg = rgba(darken(0.075, windowColor), 0.5);

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

  const FriendRow = ({ person }: { person: FriendType & { patp: string } }) => {
    const contact = contacts.getContactAvatarMetadata(person.patp);
    const pinOption = [
      {
        label: person.pinned ? 'Unpin' : 'Pin',
        onClick: (_evt: any) => {
          person.pinned ? onUnpin(person) : onPin(person);
        },
      },
    ];

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
          rowHeight={38}
          data={listData}
          rowRenderer={(rowData) => {
            if (rowData.type === 'friend') {
              const friend = rowData.data;
              return <FriendRow person={friend} />;
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
});
