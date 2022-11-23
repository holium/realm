import { FC } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';

import { Flex, Text, PersonRow } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { Member } from 'os/types';
import { WindowedList } from '@holium/design-system';

interface IMembersList {
  path: string;
}

export const MembersList: FC<IMembersList> = observer((props: IMembersList) => {
  const { path } = props;
  const { theme, spaces, membership, contacts, ship } = useServices();

  const { textColor, windowColor } = theme.currentTheme;

  const rowBg = rgba(darken(0.075, windowColor), 0.5);

  const members = Array.from(membership.getMembersList(path));
  const admins = members.filter((member: Member) =>
    member.roles.includes('admin')
  );
  const membersOnly = members.filter(
    (member: Member) =>
      member.roles.includes('member') || member.status.includes('invited')
  );

  type ListData = {
    type: string;
    data: any;
  }[];

  const listData: ListData = [
    { type: 'title', data: 'Admins' },
    ...(admins.length === 0
      ? [{ type: 'hint', data: 'No admins' }]
      : admins.map((n) => ({ type: 'member', data: n }))),
    { type: 'title', data: 'Members' },
    ...(membersOnly.length === 0
      ? [{ type: 'hint', data: 'No members added' }]
      : membersOnly.map((n) => ({ type: 'member', data: n }))),
  ];

  const ourIsAdmin = membership.isAdmin(path, ship!.patp);

  const TitleRow = ({ title }: { title: string }) => (
    <Text
      style={{ textTransform: 'uppercase' }}
      fontSize={1}
      fontWeight={600}
      opacity={0.6}
      pt={16}
      ml="2px"
      mb="4px"
    >
      {title}
    </Text>
  );

  const HintRow = ({ hint }: { hint: string }) => (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height={40}
    >
      <Text fontSize={2} opacity={0.5}>
        {hint}
      </Text>
    </Flex>
  );

  return (
    <Flex flex={1} flexDirection="column">
      <Flex flex={1} flexDirection="column" pb={16}>
        <WindowedList
          data={listData}
          renderRowElement={(rowData) => {
            if (rowData.type === 'title') {
              const title = rowData.data as string;
              return <TitleRow title={title} />;
            } else if (rowData.type === 'hint') {
              const hint = rowData.data as string;
              return <HintRow hint={hint} />;
            } else {
              const person = rowData.data;
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
            }
          }}
        />
      </Flex>
    </Flex>
  );
});
