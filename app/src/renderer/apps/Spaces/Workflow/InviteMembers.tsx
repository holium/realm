import { FC, useEffect, useMemo, useState, useRef } from 'react';
import styled from 'styled-components';
import { isValidPatp } from 'urbit-ob';
import {
  Text,
  Flex,
  Label,
  ShipSearch,
  Input,
  Icons,
  Crest,
  Box,
  Sigil,
  IconButton,
  Select,
  Skeleton,
} from 'renderer/components';
import { Row } from 'renderer/components/NewRow';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { ThemeType } from 'renderer/theme';
import { pluralize } from 'renderer/logic/lib/text';
import { MemberRole, MemberStatus } from 'os/types';
import { ShipActions } from 'renderer/logic/actions/ship';

type Roles = 'initiate' | 'member' | 'admin' | 'owner';
interface IMemberList {
  customBg: string;
  height?: any;
  theme: ThemeType;
}

const MemberList = styled(Flex)<IMemberList>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
  padding: 6px;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1px solid ${(props: IMemberList) => props.theme.colors.ui.borderColor};
  background-color: ${(props: IMemberList) => props.customBg};
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

export const InviteMembers: FC<BaseDialogProps> = observer((props: any) => {
  const { theme, ship } = useServices();
  const { inputColor, iconColor, textColor, windowColor, mode } =
    theme.currentTheme;
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
    [ship!.patp]: {
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
        const editMembers = membership.getSpaceMembers(workflowState.path)!.toJSON();
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
    if (workflowState.type === 'group') {
      setLoading(true);
      ShipActions.getGroupMembers(workflowState.path).then(
        ({ members: groupMembers }: any) => {
          // Set up our ships
          console.log(groupMembers);
          groupMembers[ship!.patp].roles = ['owner'];
          groupMembers[ship!.patp].status = 'host';
          groupMembers[ship!.patp].primaryRole = 'owner';
          selectedPatp.add(ship!.patp);
          setNicknameMap({ ...nicknameMap, [ship!.patp]: '' });
          const newMembers: any = {
            ...groupMembers,
          };
          setPermissionMap(newMembers);
          setWorkspaceState({
            ...workflowState,
            members: newMembers,
          });
          delete groupMembers[ship!.patp];
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
          [ship!.patp]: { roles: ['owner'], alias: '', status: 'host' },
        },
      });
      selectedPatp.add(ship!.patp);
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
      [patp]: { roles: ['member'], alias: '', status: 'invited' },
    };
    setPermissionMap(newMembers);
    setWorkspaceState({
      ...workflowState,
      members: newMembers,
    });
  };

  const RowRenderer = (patp: string) => {
    const nickname = nicknameMap[patp];
    const isOur = patp === ship!.patp;

    return (
      <Row
        key={patp}
        noHover
        style={{ justifyContent: 'space-between' }}
        customBg={windowColor}
      >
        <Flex gap={10} flexDirection="row" alignItems="center">
          <Box>
            <Sigil
              simple
              size={22}
              // avatar={avatar}
              patp={patp}
              color={['#000000', 'white']}
            />
          </Box>
          <Flex flexDirection="row" gap={8}>
            <Text fontSize={2}>{patp}</Text>
            <Text fontSize={2} opacity={0.5}>
              {isOur && '(you)'}
            </Text>
          </Flex>
          {nickname && nickname !== patp ? (
            <Text fontSize={2} opacity={0.7}>
              {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
            </Text>
          ) : (
            []
          )}
        </Flex>

        <Flex gap={8} justifyContent="center" alignItems="center">
          <Select
            placeholder="Select role"
            customBg={windowColor}
            textColor={textColor}
            iconColor={iconColor}
            selected={permissionMap[patp].primaryRole}
            disabled={isOur}
            options={[
              { label: 'Initiate', value: 'initiate' },
              { label: 'Member', value: 'member' },
              { label: 'Admin', value: 'admin' },
              // { label: 'Host', value: 'host' }, TODO elect a data host
              { label: 'Owner', value: 'owner', hidden: true },
            ]}
            onClick={(selected: Roles) => {
              setPermissionMap({
                ...permissionMap,
                [patp]: {
                  primaryRole: selected,
                  roles: [selected],
                  alias: '',
                  status: 'invited',
                },
              });
            }}
          />
          {!isOur && (
            <IconButton
              luminosity={mode}
              customBg={windowColor}
              // customBg={customBg ? darken(0.15, customBg) : undefined}
              size={24}
              canFocus
              isDisabled={isOur}
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
              <Icons opacity={0.5} name="Close" />
            </IconButton>
          )}
        </Flex>
      </Row>
    );
  };

  const memberPatps = Array.from(selectedPatp.values());
  const memberCount = memberPatps.length;

  if (!workflowState) return null;

  return (
    <Flex flex={1} flexDirection="column" gap={16}>
      <Text fontSize={5} lineHeight="24px" fontWeight={500} variant="body">
        Invite members
      </Text>
      <Flex gap={16} flexDirection="row" alignItems="center" height={40}>
        <Crest
          color={
            workflowState.crestOption === 'color' ? workflowState.color : ''
          }
          picture={
            workflowState.crestOption === 'image' ? workflowState.image : ''
          }
          size="md"
        />
        <Flex gap={4} flexDirection="column">
          <Text fontWeight={500} fontSize={4}>
            {workflowState.name}
          </Text>
          <Flex flexDirection="row" alignItems="center" gap={6}>
            <Text opacity={0.6} fontSize={3}>
              {workflowState.archetypeTitle}
            </Text>
            <Text opacity={0.6} fontSize={3}>
              {' • '}
            </Text>
            <Flex flexDirection="row" alignItems="center">
              {loading && (
                <Flex height={16} width={12} mr={1}>
                  <Skeleton height={16} width={12} />{' '}
                </Flex>
              )}
              <Text opacity={0.6} fontSize={3}>
                {!loading && memberCount} {pluralize('member', memberCount)}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex position="relative" flexDirection="column" height="36px">
        <Input
          tabIndex={1}
          autoCapitalize="false"
          autoCorrect="false"
          autoComplete="false"
          spellCheck="false"
          name="person"
          ref={searchRef}
          height={34}
          leftIcon={<Icons opacity={0.6} color={iconColor} name="UserAdd" />}
          placeholder="Enter Urbit ID"
          wrapperStyle={{
            backgroundColor: inputColor,
            borderRadius: 6,
            paddingRight: 4,
          }}
          value={person.state.value}
          error={
            person.computed.isDirty && person.computed.ifWasEverBlurredThenError
          }
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
          customBg={windowColor}
          onSelected={(contact: any) => {
            onShipSelected(contact);
            person.actions.onChange('');
          }}
        />
      </Flex>
      <Flex
        position="relative"
        flexDirection="column"
        flex={1}
        gap={6}
        minHeight={0}
      >
        <Label fontWeight={500}>Members</Label>
        <MemberList customBg={inputColor}>
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
  );
});
