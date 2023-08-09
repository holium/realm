import { useEffect, useState } from 'react';
import { isValidPatp } from 'urbit-ob';

import {
  Button,
  Card,
  Flex,
  Icon,
  Select,
  Text,
  TextInput,
} from '@holium/design-system';

import { api, Perms, Roles } from '../api';
import { log } from '../utils';
declare module 'urbit-ob';

interface Props {
  setVisible: (value: boolean) => void;
  space: string;
  calendarId: null | string;
  edit: boolean;
  defaultValues?: { title: string; perms: Perms };
}
export const CalendarPerms = ({
  defaultValues,
  setVisible,
  space,
  edit,
  calendarId,
}: Props) => {
  const [newCalendar, setNewCalendar] = useState<string>('');
  const [selectedAdminPerm, setSelectedAdminPerm] = useState<Roles>('admin');
  const [selectedMemberPerm, setSelectedMemberPerm] = useState<Roles>('member');
  const [selectedCustomShipPerm, setSelectedCustomShipPerm] =
    useState<Roles>('member');
  const [newCustomShip, setNewCustomShip] = useState<string>('');
  const [customShipRoleList, setCustomShipRoleList] = useState<any>([
    { ship: '~zod', role: 'admin', id: '1' },
  ]);
  const addCalendar = async () => {
    try {
      const custom: any = {};
      for (const customRole of customShipRoleList) {
        custom[customRole.ship] = customRole.role;
      }
      const perms = {
        admins: selectedAdminPerm,
        member: selectedMemberPerm,
        custom,
      };
      const result = await api.createCalendar(space, newCalendar, '', perms);
      log('addCalendar result => ', result);
    } catch (e) {
      log('addCalendar error => ', e);
    }
    setVisible(false);
  };
  const updateCalendar = async () => {
    if (!calendarId) return;
    if (!newCalendar) return; // TODO: should be called newTitle?
    try {
      const custom: { [key: string]: Roles } = {};
      for (const customRole of customShipRoleList) {
        custom[customRole.ship] = customRole.role;
      }
      const perms = {
        admins: selectedAdminPerm,
        member: selectedMemberPerm,
        custom,
      };
      const reperm = await api.repermCalendar(space, calendarId, perms);
      const updateMetadata = await api.updateCalendar(calendarId, {
        title: newCalendar,
      }); // Only updating title for now
      log('updateCalendar reperm => ', reperm);
      log('updateCalendar updateMetadata => ', updateMetadata);
    } catch (e) {
      log('updateCalendar error => ', e);
    }
    setVisible(false);
  };
  const addCustomShip = () => {
    if (!newCustomShip) return; // Epty ship name, do nothing
    const isValid = isValidPatp(newCustomShip);
    if (!isValid) return; // Not a valid ship, do nothing
    const shipExists = customShipRoleList.filter(
      (item: any) => item.ship === newCustomShip
    );
    if (shipExists.length > 0) return; // Ship already in list, do nothing
    const newCustomShipRoleList = [...customShipRoleList];
    newCustomShipRoleList.push({
      ship: newCustomShip,
      role: selectedCustomShipPerm,
      id: newCustomShipRoleList.length + 1,
    });
    // Reset to default values
    setSelectedCustomShipPerm('member');
    setCustomShipRoleList(newCustomShipRoleList);
    setNewCustomShip('');
  };
  const deleteCustomShip = (id: string) => {
    //filter out given ship (id)
    const newCustomShipRoleList = [...customShipRoleList].filter(
      (item: any) => item.id !== id
    );
    setCustomShipRoleList(newCustomShipRoleList);
  };
  useEffect(() => {
    if (defaultValues) {
      setNewCalendar(defaultValues.title);
      defaultValues.perms.admins &&
        setSelectedAdminPerm(defaultValues.perms.admins);
      defaultValues.perms.member &&
        setSelectedMemberPerm(defaultValues.perms.member);
      const newCustomShipRoleList = [];

      for (const customRole in defaultValues.perms.custom) {
        newCustomShipRoleList.push({
          ship: customRole,
          role: defaultValues.perms.custom[customRole],
          id: newCustomShipRoleList.length + 1,
        });
      }
      setCustomShipRoleList(newCustomShipRoleList);
    }
  }, [defaultValues]);
  return (
    <Card p={3}>
      <Flex flexDirection={'column'} gap="10px" maxWidth={280}>
        <TextInput
          id="new-calendar-input"
          name="new-calendar-input"
          autoFocus
          placeholder="New calendar"
          value={newCalendar}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewCalendar(evt.target.value);
          }}
          //    onBlur={() => setIsAdding(false)}
        />
        <Flex gap="10px">
          <Flex flexDirection="column" alignItems={'center'} gap="5px">
            <Text.Label fontWeight={600}>Admin Role</Text.Label>
            <Select
              id="select-admin-role"
              width={90}
              options={[
                { label: 'admin', value: 'admin' },
                { label: 'member', value: 'member' },
                { label: 'viewer', value: 'viewer' },
                { label: 'guest', value: 'guest' },
              ]}
              selected={selectedAdminPerm}
              onClick={(value) => {
                setSelectedAdminPerm(value as Roles);
              }}
            />
          </Flex>
          <Flex flexDirection="column" alignItems={'center'} gap="5px">
            <Text.Label fontWeight={600}>Member Role</Text.Label>
            <Select
              id="select-member-role"
              width={90}
              options={[
                { label: 'member', value: 'member' },
                { label: 'admin', value: 'admin' },
                { label: 'viewer', value: 'viewer' },
                { label: 'guest', value: 'guest' },
              ]}
              selected={selectedMemberPerm}
              onClick={(value) => {
                setSelectedMemberPerm(value as Roles);
              }}
            />
          </Flex>
        </Flex>
        <Flex alignItems={'center'}>
          <TextInput
            id="new-custom-ship-role"
            name="new-custom-ship-role"
            autoFocus
            placeholder="~zod"
            value={newCustomShip}
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter' && newCustomShip.length > 0) {
                addCustomShip();
              }
            }}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomShip(evt.target.value);
            }}
            height={'40px'}
          />
          <Select
            id="select-custom-ship-role"
            width={90}
            options={[
              { label: 'admin', value: 'admin' },
              { label: 'member', value: 'member' },
              { label: 'viewer', value: 'viewer' },
              { label: 'guest', value: 'guest' },
            ]}
            selected={selectedCustomShipPerm}
            onClick={(value) => {
              setSelectedCustomShipPerm(value as Roles);
            }}
          />
          <Button.IconButton
            size={26}
            onClick={(e) => {
              e.stopPropagation();
              addCustomShip();
            }}
          >
            <Icon name="Plus" size={24} opacity={0.5} />
          </Button.IconButton>
        </Flex>
        {customShipRoleList.map((item: any, index: number) => {
          return (
            <Flex
              justifyContent={'space-between'}
              alignItems="center"
              key={'custom-ship-role-item-' + index}
            >
              <Text.Body fontWeight={600}>
                {item.ship} ({item.role})
              </Text.Body>

              <Button.IconButton
                size={26}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCustomShip(item.id);
                }}
              >
                <Icon name="Trash" size={16} opacity={0.5} />
              </Button.IconButton>
            </Flex>
          );
        })}
        <Flex marginTop={'10px'} gap="5px" height="30px">
          <Button.Transparent
            fontWeight={600}
            onClick={() => setVisible(false)}
          >
            Cancel
          </Button.Transparent>
          <Button.Primary
            flex={1}
            justifyContent={'center'}
            onClick={() => {
              edit ? updateCalendar() : addCalendar();
            }}
          >
            Save
          </Button.Primary>
        </Flex>
      </Flex>
    </Card>
  );
};
