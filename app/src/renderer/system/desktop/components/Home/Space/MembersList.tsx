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
import { Member } from 'os/types';

interface IMembersList {
  members: any[];
}

export const MembersList: FC<IMembersList> = observer((props: IMembersList) => {
  const { members } = props;
  const { desktop, spaces } = useServices();

  const { textColor, windowColor } = desktop.theme;

  const rowBg = rgba(darken(0.075, windowColor), 0.5);

  const admins = members.filter((member: Member) =>
    member.roles.includes('admin')
  );
  const membersOnly = members.filter((member: Member) =>
    member.roles.includes('member')
  );
  const initiatesOnly = members.filter((member: Member) =>
    member.roles.includes('initiate')
  );

  const RowRenderer = (
    { index, style }: { index: number; style: any },
    role: 'admin' | 'member' | 'initiate'
  ) => {
    let person: any;
    if (role === 'admin') {
      person = admins[index];
    }
    if (role === 'member') {
      person = membersOnly[index];
    }
    if (role === 'initiate') {
      person = initiatesOnly[index];
    }

    return (
      <PersonRow
        patp={person!.patp}
        nickname={person!.nickname}
        sigilColor={person!.color}
        avatar={person!.avatar}
        description={person!.description}
        listId="member-list"
        rowBg={rowBg}
        style={{ ...style }}
        theme={{
          textColor,
          windowColor,
        }}
        contextMenuOptions={[
          {
            label: 'Kick',
            onClick: (_evt: any) => {
              SpacesActions.kickMember(spaces.selected!.path, person!.patp);
            },
          },
        ]}
      >
        {person.status === 'invited' && (
          <Text opacity={0.3} fontSize={1}>
            Pending
          </Text>
        )}
      </PersonRow>
    );
  };

  //
  const showHint = members.length === 0;
  return (
    <>
      <Flex
        mt={18}
        height={admins.length === 0 ? 60 : 24 + admins.length * 42}
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
          Admins
        </Text>
        {/* {admins.length === 0 && (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height={40}
          >
            <Text fontSize={2} opacity={0.5}>
              No admins added
            </Text>
          </Flex>
        )} */}
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              className="List"
              height={height}
              itemCount={admins.length}
              itemSize={40}
              width={width}
            >
              {(pinProps: { index: number; style: any }) =>
                RowRenderer(pinProps, 'admin')
              }
            </List>
          )}
        </AutoSizer>
      </Flex>
      <Flex
        mt={18}
        height={24 + membersOnly.length * 42}
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
          Members
        </Text>
        {showHint && (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height={40}
          >
            <Text fontSize={2} opacity={0.5}>
              No members added
            </Text>
          </Flex>
        )}
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              className="List"
              height={height}
              itemCount={membersOnly.length}
              itemSize={44}
              width={width}
            >
              {(pinProps: { index: number; style: any }) =>
                RowRenderer(pinProps, 'member')
              }
            </List>
          )}
        </AutoSizer>
      </Flex>
    </>
  );
});
