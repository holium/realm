import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import { Flex, Text, PersonRow } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { Member } from 'os/types';
import { WindowedList } from '@holium/design-system';
import { MemberType } from 'os/services/spaces/models/members';

interface IMembersList {
  path: string;
}

type Roles = 'initiate' | 'member' | 'admin' | 'owner';

const MembersListPresenter = (props: IMembersList) => {
  const { path } = props;
  const { theme, spaces, membership, ship, friends } = useServices();

  const rowBg = rgba(darken(0.075, theme.currentTheme.windowColor), 0.5);

  let members = Array.from(membership.getMembersList(path));
  const admins = members.filter((member: Member) =>
    member.roles.includes('admin')
  );
  members = members.filter((member: Member) => !member.roles.includes('admin'));

  const membersOnly = members.filter(
    (member: Member) =>
      member.roles.includes('member') || member.status.includes('invited')
  );

  type ListData = {
    type: string;
    data: any;
  }[];

  const listData: ListData = useMemo(
    () => [
      { type: 'title', data: 'Admins' },
      ...(admins.length === 0
        ? [{ type: 'hint', data: 'No admins' }]
        : admins.map((n) => ({ type: 'member', data: n }))),
      { type: 'title', data: 'Members' },
      ...(membersOnly.length === 0
        ? [{ type: 'hint', data: 'No members added' }]
        : membersOnly.map((n) => ({ type: 'member', data: n }))),
    ],
    [admins, membersOnly]
  );

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

  const MemberRow = ({ member }: { member: MemberType & { patp: string } }) => {
    const contact = friends.getContactAvatarMetadata(member.patp);

    const roles = Array.from(member.roles);
    let activeRole = 'initiate';
    if (roles) {
      if (roles.includes('admin')) activeRole = 'admin';
      else if (roles.includes('member')) activeRole = 'member';
      else if (roles.includes('initiate')) {
        activeRole = 'initiate';
      }
    }
    const setNewRole = (role: Roles) => {
      const newRoles = roles
        ? [...roles.filter((role) => role !== activeRole), role]
        : [role];
      SpacesActions.setRoles(member.patp, newRoles);
    };

    if (!ship) return null;
    if (!spaces.selected) return null;

    return (
      <PersonRow
        key={`${member.patp}-member`}
        patp={member.patp}
        nickname={contact.nickname}
        sigilColor={contact.color}
        avatar={contact.avatar}
        description={contact.bio}
        listId="member-list"
        rowBg={rowBg}
        theme={theme.currentTheme}
        contextMenuOptions={
          membership.isAdmin(path, ship.patp) && member.patp !== ship.patp
            ? [
                activeRole === 'admin'
                  ? {
                      label: 'Demote to member',
                      onClick: () => {
                        setNewRole('member');
                      },
                    }
                  : {
                      label: 'Promote to admin',
                      onClick: () => {
                        setNewRole('admin');
                      },
                    },
                {
                  label: 'Kick',
                  onClick: () => {
                    SpacesActions.kickMember(
                      spaces.selected?.path ?? '',
                      member.patp
                    );
                  },
                },
              ]
            : []
        }
      >
        {member.status === 'invited' && (
          <Text opacity={0.3} fontSize={1}>
            Invited
          </Text>
        )}
      </PersonRow>
    );
  };

  return (
    <Flex flex={1} flexDirection="column" pb={16}>
      <WindowedList
        width={298}
        data={listData}
        itemContent={(_, rowData) => {
          if (rowData.type === 'title') {
            const title = rowData.data as string;
            return <TitleRow title={title} />;
          } else if (rowData.type === 'hint') {
            const hint = rowData.data as string;
            return <HintRow hint={hint} />;
          } else {
            const member = rowData.data;
            return <MemberRow member={member} />;
          }
        }}
      />
    </Flex>
  );
};

export const MembersList = observer(MembersListPresenter);
