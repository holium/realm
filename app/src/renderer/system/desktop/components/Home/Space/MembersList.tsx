import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import { Flex, Text, PersonRow } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { ShipActions } from 'renderer/logic/actions/ship';
import { Member } from 'os/types';
import { WindowedList } from '@holium/design-system';
import { MemberType } from 'os/services/spaces/models/members';
import { FriendType } from 'os/services/ship/models/friends';

interface IMembersList {
  path: string;
  our: boolean;
}

type Roles = 'initiate' | 'member' | 'admin' | 'owner';

const MembersListPresenter = (props: IMembersList) => {
  const { path, our } = props;
  const { theme, spaces, membership, ship, friends } = useServices();

  const rowBg = rgba(darken(0.075, theme.currentTheme.windowColor), 0.5);

  const pinned = useMemo(() => friends.pinned || [], [friends.pinned]);
  const unpinned = useMemo(() => friends.unpinned || [], [friends.unpinned]);
  const members = useMemo(() => membership.getMembersList(path), [path]);
  const admins = useMemo(
    () => members.filter((member: Member) => member.roles.includes('admin')),
    [members]
  );
  const membersOnly = useMemo(
    () =>
      members.filter(
        (member: Member) =>
          member.roles.includes('member') || member.status.includes('invited')
      ),
    [members]
  );

  type ListData = {
    type: string;
    data: any;
  }[];

  const memberListData: ListData = useMemo(
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

  const friendListData: ListData = useMemo(
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

  const TitleRow = ({ title }: { title: string }) => (
    <Text
      key={title}
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

  const MemberRow = ({
    member,
  }: {
    member: MemberType & { patp: string; shortPatp: string };
  }) => {
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
        shortPatp={member.shortPatp}
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

  const FriendRow = ({
    friend,
  }: {
    friend: FriendType & { patp: string; shortPatp: string };
  }) => {
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
        shortPatp={friend.shortPatp}
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
    <Flex flex={1} flexDirection="column" pb={16}>
      <WindowedList
        width={298}
        data={our ? friendListData : memberListData}
        itemContent={(_, rowData) => {
          switch (rowData.type) {
            case 'title':
              const title = rowData.data as string;
              return <TitleRow title={title} />;
            case 'hint':
              const hint = rowData.data as string;
              return <HintRow hint={hint} />;
            case 'member':
              const member = rowData.data;
              return <MemberRow member={member} />;
            case 'friend':
              const friend = rowData.data;
              return <FriendRow friend={friend} />;
            default:
              console.error('Invalid rowData', rowData);
              return null;
          }
        }}
      />
    </Flex>
  );
};

export const MembersList = observer(MembersListPresenter);
