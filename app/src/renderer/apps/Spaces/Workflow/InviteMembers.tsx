import { FC, useEffect, useMemo, useState, useRef } from 'react';
import styled from 'styled-components';
import { isValidPatp } from 'urbit-ob';

import {
  Grid,
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
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
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

const heightOffset = 0;

export const InviteMembers: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { theme, ship } = useServices();
    const { inputColor, iconColor, textColor, windowColor, mode, dockColor } =
      theme.currentTheme;
    const { workflowState, setState } = props;
    const searchRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const { peopleForm, person } = useMemo(() => createPeopleForm(), []);
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

    const setWorkspaceState = (obj: any) => {
      setState &&
        setState({
          ...workflowState,
          ...obj,
        });
    };

    // Setting up options menu
    useEffect(() => {
      if (workflowState.type === 'group') {
        setLoading(true);
        ShipActions.getGroupMembers(workflowState.path).then((groupMembers: any) => {
          const newMembers: any = {
            ...permissionMap,
            ...groupMembers,
          };
          setPermissionMap(newMembers);
          setWorkspaceState({
            ...workflowState,
            members: newMembers,
          });
          for (var member of Object.keys(groupMembers)) {
            selectedPatp.add(member);
            setNicknameMap({ ...nicknameMap, [member]: '' });
          }
          setLoading(false);
        });
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

    const onShipRemoved = (patp: string) => {};

    const RowRenderer = ({ index, style }: { index: number; style: any }) => {
      const patp = Array.from(selectedPatp.values())[index];
      const nickname = nicknameMap[patp];
      const isOur = patp === ship!.patp;
      // const contact = Shi
      // const nickname = contact[1].nickname!;
      // const sigilColor = contact[1].color!;
      // const avatar = contact[1].avatar!;
      return (
        <div style={style}>
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
                  }}
                >
                  <Icons opacity={0.5} name="Close" />
                </IconButton>
              )}
            </Flex>
          </Row>
        </div>
      );
    };
    const memberCount = Array.from(selectedPatp.values()).length;

    return workflowState ? (
      <Grid.Column noGutter lg={12} xl={12}>
        <Text
          fontSize={5}
          lineHeight="24px"
          fontWeight={500}
          mb={16}
          variant="body"
        >
          Invite members
        </Text>
        <Flex flexDirection="column" gap={16} height="100%">
          <Flex flexDirection="column" gap={16} height="calc(100% - 40px)">
            <Flex gap={16} flexDirection="row" alignItems="center">
              <Crest
                color={!workflowState.image ? workflowState.color : ''}
                picture={workflowState.image}
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

                  <Text opacity={0.6} fontSize={3}>
                    {memberCount} {pluralize('member', memberCount)}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              position="relative"
              flexDirection="column"
              height="fit-content"
            >
              <Input
                tabIndex={1}
                autoCapitalize="false"
                autoCorrect="false"
                autoComplete="false"
                name="person"
                ref={searchRef}
                height={34}
                leftIcon={
                  <Icons opacity={0.6} color={iconColor} name="UserAdd" />
                }
                placeholder="Enter Urbit ID"
                wrapperStyle={{
                  backgroundColor: inputColor,
                  borderRadius: 6,
                  paddingRight: 4,
                }}
                value={person.state.value}
                error={person.computed.ifWasEverBlurredThenError}
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
                heightOffset={0}
                search={person.state.value}
                selected={selectedPatp}
                customBg={windowColor}
                onSelected={(contact: any) => {
                  onShipSelected(contact);
                  person.actions.onChange('');
                }}
              />
            </Flex>
            <Flex position="relative" flexDirection="column" flex={1} gap={6}>
              <Label fontWeight={500}>Members</Label>
              <MemberList customBg={inputColor}>
                <AutoSizer>
                  {({ height, width }: { height: number; width: number }) => (
                    <List
                      className="List"
                      height={height - heightOffset}
                      itemCount={memberCount}
                      itemSize={40}
                      width={width - 2}
                    >
                      {RowRenderer}
                    </List>
                  )}
                </AutoSizer>
              </MemberList>
            </Flex>
          </Flex>
        </Flex>
      </Grid.Column>
    ) : null;
  }
);
