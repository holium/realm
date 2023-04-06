import { useEffect, useMemo, useState, useRef } from 'react';
import styled from 'styled-components';
import { isValidPatp } from 'urbit-ob';
import {
  Text,
  Button,
  Icon,
  Avatar,
  Box,
  Flex,
  Select,
  Skeleton,
  TextInput,
} from '@holium/design-system';
import { ShipSearch, Crest } from 'renderer/components';
import { Row } from 'renderer/components/NewRow';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { pluralize } from 'renderer/logic/lib/text';
import { MemberRole, MemberStatus } from 'os/types';
import { ShipActions } from 'renderer/logic/actions/ship';
import { useShipStore } from 'renderer/stores/ship.store';

interface IMemberList {
  height?: any;
}

const MemberList = styled(Flex)<IMemberList>`
  display: flex;
  flex-direction: column;
  height: 294px;
  min-height: 0;
  padding: 6px;
  border-radius: 6px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-window-rgba));
`;

export const createPeopleForm = (
  defaults: any = {
    person: '',
  }
) => {
  const peopleForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const person = createField({
    id: 'person',
    form: peopleForm,
    initialValue: defaults.person || '',
    validate: (patp: string) => {
      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }
      return { error: 'Invalid patp', parsed: undefined };
    },
  });

  return {
    peopleForm,
    person,
  };
};

const InviteMembersPresenter = (props: BaseDialogProps) => {
  const { ship, friends } = useShipStore();
  const { workflowState, setState } = props;
  const searchRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { person } = useMemo(() => createPeopleForm(), []);
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());
  const [nicknameMap, setNicknameMap] = useState<{ [patp: string]: string }>(
    {}
  );
  const [permissionMap, setPermissionMap] = useState<{
    [patp: string]: {
      primaryRole: MemberRole;
      roles: [string];
      alias: string;
      status: MemberStatus;
    };
  }>({
    [ship?.patp ?? '']: {
      primaryRole: 'owner',
      roles: ['owner'],
      alias: '',
      status: 'host',
    },
  });

  const setWorkspaceState = (newState: any) => {
    setState?.(newState);
  };

  // Setting up options menu
  useEffect(() => {
    /*      if (props.edit) {
        const editMembers = membership.getSpaceMembers(workflowState.path).toJSON();
        let members: any = {}
        for (var member of Object.keys(editMembers)) {
          const memberVal = editMembers[member]
          const primaryRole: string =
            memberVal.roles.includes('admin')
            ? 'admin'
            : memberVal.roles.includes('member')
            ? 'member'
            : 'initiate';
          members[member] = { primaryRole, roles: memberVal.roles, alias: memberVal.alias, status: memberVal.status};
          selectedPatp.add(member);
          setNicknameMap({ ...nicknameMap, [member]: '' });
        }
        setPermissionMap(members);
        setWorkspaceState({members});
      }*/
    if (!ship) return;
    if (workflowState.type === 'group') {
      setLoading(true);
      ShipActions.getGroupMembers(workflowState.path).then(
        ({ members: groupMembers }: any) => {
          // Set up our ships
          console.log(groupMembers);
          groupMembers[ship.patp].roles = ['owner'];
          groupMembers[ship.patp].status = 'host';
          groupMembers[ship.patp].primaryRole = 'owner';
          selectedPatp.add(ship.patp);
          setNicknameMap({ ...nicknameMap, [ship.patp]: '' });
          const newMembers: any = {
            ...groupMembers,
          };
          setPermissionMap(newMembers);
          setWorkspaceState({
            ...workflowState,
            members: newMembers,
          });
          delete groupMembers[ship.patp];
          for (var member of Object.keys(groupMembers)) {
            selectedPatp.add(member);
            setNicknameMap({ ...nicknameMap, [member]: '' });
          }
          setLoading(false);
        }
      );
    } else {
      setWorkspaceState({
        ...workflowState,
        members: {
          [ship.patp]: {
            roles: ['owner'],
            alias: '',
            status: 'host',
            primaryRole: 'owner',
          },
        },
      });
      selectedPatp.add(ship.patp);
    }
  }, []);

  const onShipSelected = (contact: [string, string?]) => {
    const patp = contact[0];
    const nickname = contact[1];
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
    setNicknameMap({ ...nicknameMap, [patp]: nickname || '' });
    const newMembers: any = {
      ...permissionMap,
      [patp]: {
        roles: ['member'],
        alias: '',
        status: 'invited',
        primaryRole: 'member',
      },
    };
    setPermissionMap(newMembers);
    setWorkspaceState({
      ...workflowState,
      members: newMembers,
    });
  };

  const RowRenderer = (patp: string) => {
    const nickname = nicknameMap[patp];
    const isOur = patp === ship?.patp;
    const contact = friends.getContactAvatarMetadata(patp);

    return (
      <Row key={patp} noHover style={{ justifyContent: 'space-between' }}>
        <Flex gap={10} row align="center">
          <Box>
            <Avatar
              simple
              size={22}
              avatar={contact.avatar || null}
              patp={patp}
              sigilColor={[contact.color || '#000000', 'white']}
            />
          </Box>
          <Flex row gap={8}>
            <Text.Custom fontSize={2}>{patp}</Text.Custom>
            <Text.Custom fontSize={2} opacity={0.5}>
              {isOur && '(you)'}
            </Text.Custom>
          </Flex>
          {nickname && nickname !== patp ? (
            <Text.Custom fontSize={2} opacity={0.7}>
              {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
            </Text.Custom>
          ) : (
            []
          )}
        </Flex>

        <Flex row gap={8} justify="center" align="center">
          <Select
            id="select-role"
            placeholder="Select role"
            selected={permissionMap[patp].primaryRole}
            disabled={isOur}
            options={[
              { label: 'Initiate', value: 'initiate' },
              { label: 'Member', value: 'member' },
              { label: 'Admin', value: 'admin' },
              // { label: 'Host', value: 'host' }, TODO elect a data host
              { label: 'Owner', value: 'owner', hidden: true },
            ]}
            onClick={(selected) => {
              setPermissionMap({
                ...permissionMap,
                [patp]: {
                  primaryRole: selected as MemberRole,
                  roles: [selected],
                  alias: '',
                  status: 'invited',
                },
              });
            }}
          />
          {!isOur && (
            <Button.IconButton
              size={24}
              disabled={isOur}
              onClick={(evt: any) => {
                evt.stopPropagation();
                const copyPatp = selectedPatp;
                copyPatp.delete(patp);
                setSelected(new Set(copyPatp));
                const nickMap = nicknameMap;
                delete nickMap[patp];
                setNicknameMap(nickMap);
                const delMembers = workflowState.members;
                delete delMembers[patp];
                setWorkspaceState({
                  ...workflowState,
                  members: delMembers,
                });
              }}
            >
              <Icon opacity={0.5} name="Close" size={16} />
            </Button.IconButton>
          )}
        </Flex>
      </Row>
    );
  };

  const memberPatps = Array.from(selectedPatp.values());
  const memberCount = memberPatps.length;

  if (!workflowState) return null;

  return (
    <Flex col width="100%" overflowY="hidden">
      <Text.Custom
        fontSize={5}
        lineHeight="24px"
        fontWeight={500}
        mb={16}
        variant="body"
      >
        Invite members
      </Text.Custom>
      <Flex col gap={16} justify="flex-start">
        <Flex gap={16} row align="center" height={75}>
          <Crest
            color={
              workflowState.crestOption === 'color' ? workflowState.color : ''
            }
            picture={
              workflowState.crestOption === 'image' ? workflowState.image : ''
            }
            size="md"
          />
          <Flex gap={6} flexDirection="column">
            <Text.Custom fontWeight={500} fontSize={4}>
              {workflowState.name}
            </Text.Custom>
            <Flex flexDirection="row" alignItems="center" gap={6}>
              <Text.Custom opacity={0.6} fontSize={3}>
                {workflowState.archetypeTitle}
              </Text.Custom>
              <Text.Custom opacity={0.6} fontSize={3}>
                {' • '}
              </Text.Custom>
              <Flex flexDirection="row" alignItems="center">
                {loading && (
                  <Flex height={16} width={12} mr={1}>
                    <Skeleton height={16} width={12} />{' '}
                  </Flex>
                )}
                <Text.Custom opacity={0.6} fontSize={3}>
                  {!loading && memberCount} {pluralize('member', memberCount)}
                </Text.Custom>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex position="relative" flexDirection="column">
          <TextInput
            tabIndex={1}
            autoCapitalize="false"
            autoCorrect="false"
            autoComplete="false"
            spellCheck="false"
            id="person"
            name="person"
            ref={searchRef}
            height={34}
            leftAdornment={<Icon opacity={0.6} name="UserAdd" size={18} />}
            placeholder="Enter Urbit ID"
            style={{
              borderRadius: 6,
              paddingRight: 4,
            }}
            value={person.state.value}
            // error={
            //   person.computed.isDirty &&
            //   person.computed.ifWasEverBlurredThenError
            // }
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter' && person.computed.parsed) {
                onShipSelected([person.computed.parsed, '']);
                person.actions.onChange('');
              }
            }}
            onChange={(e: any) => {
              person.actions.onChange(e.target.value);
            }}
            onFocus={() => {
              person.actions.onFocus();
            }}
            onBlur={() => {
              person.actions.onBlur();
            }}
          />
          <ShipSearch
            isDropdown
            search={person.state.value}
            selected={selectedPatp}
            onSelected={(contact: any) => {
              onShipSelected(contact);
              person.actions.onChange('');
            }}
          />
        </Flex>
        <Flex position="relative" flexDirection="column" gap={6} height={294}>
          <Text.Label fontWeight={500}>Members</Text.Label>
          <MemberList>
            {!loading ? (
              memberPatps.map(RowRenderer)
            ) : (
              <Flex flexDirection="column" gap={4}>
                <Skeleton height={30} />
                <Skeleton height={30} />
                <Skeleton height={30} />
              </Flex>
            )}
          </MemberList>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const InviteMembers = observer(InviteMembersPresenter);
