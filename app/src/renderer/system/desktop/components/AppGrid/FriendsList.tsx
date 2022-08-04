import { FC, useRef, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createField, createForm } from 'mobx-easy-form';
import { isValidPatp } from 'urbit-ob';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, lighten, darken } from 'polished';

import {
  Flex,
  Icons,
  Text,
  Input,
  TextButton,
  PersonRow,
  ShipSearch,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { toJS } from 'mobx';

interface IFriendsList {
  friends: any[];
}

export const FriendsList: FC<IFriendsList> = observer((props: IFriendsList) => {
  const { friends } = props;
  const { shell, spaces } = useServices();
  const searchRef = useRef(null);

  const { textColor, windowColor } = shell.desktop.theme;

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
    () => friends.filter((friend: any) => !friend.pinned && !friend.mutual),
    [friends && friends.filter((friend: any) => !friend.pinned).length]
  );

  const onUnpin = (person: any) => {
    SpacesActions.editFriend(person.patp, {
      pinned: false,
      tags: person.tags,
    });
  };

  const onPin = (person: any) => {
    SpacesActions.editFriend(person.patp, {
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

    return (
      <PersonRow
        patp={person.patp}
        nickname={person.nickname}
        sigilColor={person.color}
        avatar={person.avatar}
        description={person.description}
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
              SpacesActions.removeFriend(person.patp);
            },
          },
        ]}
      />
    );
  };

  //
  const showHint =
    friends.length === 0 || (pinned.length > 0 && all.length === 0);
  return (
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
              {friends.length === 0 ? 'No friends to pin' : 'No friends pinned'}
            </Text>
          </Flex>
        )}
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              className="List"
              height={height}
              itemCount={pinned.length}
              itemSize={40}
              width={width}
            >
              {(pinProps: { index: number; style: any }) =>
                RowRenderer(pinProps, true)
              }
            </List>
          )}
        </AutoSizer>
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
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              className="List"
              height={height}
              itemCount={all.length}
              itemSize={44}
              width={width}
            >
              {(pinProps: { index: number; style: any }) =>
                RowRenderer(pinProps, false)
              }
            </List>
          )}
        </AutoSizer>
      </Flex>
    </>
  );
});
