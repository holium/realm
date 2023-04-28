import { useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import { Flex, Text, WindowedList } from '@holium/design-system';

import { PersonRow } from 'renderer/components/People/PersonRow';
import { useAppState } from 'renderer/stores/app.store';
import { FriendType } from 'renderer/stores/models/friends.model';
import { MemberType } from 'renderer/stores/models/invitations.model';
import { useShipStore } from 'renderer/stores/ship.store';

interface IMembersList {
  our: boolean;
}
type Roles = 'initiate' | 'member' | 'admin' | 'owner';

const MembersListPresenter = ({ our }: IMembersList) => {
  const { loggedInAccount } = useAppState();
  const { spacesStore, friends } = useShipStore();
  const currentSpace = spacesStore.selected;

  const pinned = useMemo(() => friends.pinned || [], [friends.pinned]);
  const unpinned = useMemo(() => friends.unpinned || [], [friends.unpinned]);
  let members = currentSpace ? Array.from(currentSpace?.members.list) : [];
  const admins = members.filter((member) => member.roles.includes('admin'));
  members = members.filter((member) => !member.roles.includes('admin'));
  const membersOnly = members.filter(
    (member) =>
      member.roles.includes('member') || member.status.includes('invited')
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
    <Text.Custom
      style={{ textTransform: 'uppercase' }}
      fontSize={1}
      fontWeight={600}
      opacity={0.6}
      pt={16}
      ml="2px"
      mb="4px"
    >
      {title}
    </Text.Custom>
  );

  const HintRow = ({ hint }: { hint: string }) => (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height={40}
    >
      <Text.Custom fontSize={2} opacity={0.5}>
        {hint}
      </Text.Custom>
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

    if (!loggedInAccount) return null;
    if (!currentSpace) return null;

    const setNewRole = (role: Roles) => {
      const newRoles = roles
        ? [...roles.filter((role) => role !== activeRole), role]
        : [role];
      currentSpace.path &&
        spacesStore.setRoles(currentSpace.path, member.patp, newRoles);
    };

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
        contextMenuOptions={
          currentSpace.members.isAdmin(loggedInAccount.patp) &&
          member.patp !== loggedInAccount.patp
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
                    currentSpace.path &&
                      spacesStore.kickMember(currentSpace.path, member.patp);
                  },
                },
              ]
            : []
        }
      >
        {member.status === 'invited' && (
          <Text.Custom opacity={0.3} fontSize={1}>
            Invited
          </Text.Custom>
        )}
      </PersonRow>
    );
  };

  const onUnpin = (friend: any) => {
    friends.editFriend(friend.patp, {
      pinned: false,
      tags: toJS(friend.tags),
    });
  };

  const onPin = (friend: any) => {
    friends.editFriend(friend.patp, {
      pinned: true,
      tags: toJS(friend.tags),
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
        contextMenuOptions={[
          ...pinOption,
          {
            label: 'Remove',
            onClick: (_evt: any) => {
              friends.removeFriend(friend.patp);
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
