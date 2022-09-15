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
  path: string;
}

export const MembersList: FC<IMembersList> = observer((props: IMembersList) => {
  const { path } = props;
  const { desktop, spaces, membership, contacts, ship } = useServices();

  const { textColor, windowColor } = desktop.theme;

  const rowBg = rgba(darken(0.075, windowColor), 0.5);

  const members = Array.from(membership.getMembersList(path));
  const admins = members.filter((member: Member) =>
    member.roles.includes('admin')
  );
  const membersOnly = members.filter(
    (member: Member) =>
      member.roles.includes('member') || member.status.includes('invited')
  );

  const ourIsAdmin = membership.isAdmin(path, ship!.patp!);
  console.log(toJS(ourIsAdmin));
  const RowRenderer = (
    { index, style }: { index: number; style: any },
    role: 'admin' | 'member'
  ) => {
    let person: any;
    if (role === 'admin') {
      person = admins[index];
    }
    if (role === 'member') {
      person = membersOnly[index];
    }

    const contact = contacts.getContactAvatarMetadata(person.patp);

    return (
      <PersonRow
        key={person!.patp}
        patp={person!.patp}
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
        contextMenuOptions={
          ourIsAdmin
            ? [
                {
                  label: 'Kick',
                  onClick: (_evt: any) => {
                    SpacesActions.kickMember(
                      spaces.selected!.path,
                      person!.patp
                    );
                  },
                },
              ]
            : []
        }
      >
        {person.status === 'invited' && (
          <Text opacity={0.3} fontSize={1}>
            Invited
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
        <List height={40} itemSize={40} width="100%" itemCount={admins.length}>
          {(pinProps: { index: number; style: any }) =>
            RowRenderer(pinProps, 'admin')
          }
        </List>
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

        <List
          height={400}
          itemSize={40}
          width="100%"
          itemCount={membersOnly.length}
        >
          {(pinProps: { index: number; style: any }) =>
            RowRenderer(pinProps, 'member')
          }
        </List>
      </Flex>
      {/* <Flex
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

          <List
            height={40}
            itemSize={40}
            width="100%"
            itemCount={membersOnly.length}
          >
            {(pinProps: { index: number; style: any }) =>
              RowRenderer(pinProps, 'member')
            }
          </List>
        </Flex> */}
    </>
  );
});
