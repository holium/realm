import { useState } from 'react';

import { Button, Flex, Icon, Menu, Text } from '@holium/design-system';

import { api, Perms } from '../api';
import { log } from '../utils';
import { CalendarPerms } from './CalendarPerms';

interface Props {
  title: string;
  description: string;
  id: string;
  onCalendarSelect: (id: string) => void;
  selectedCalendar: null | string;
  space: string;
  calendarId: string;
  perms: Perms;
}

export const CalendarItem = ({
  title,
  id,
  onCalendarSelect,
  selectedCalendar,
  space,
  calendarId,
  perms,
}: Props) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const deleteCalendar = async (id: string) => {
    try {
      const result = await api.deleteCalendar(space, id);

      log('deleteCalendar result => ', result);
    } catch (e) {
      log('deleteCalendar error => ', e);
    }
  };

  return (
    <>
      {isEditing ? (
        <CalendarPerms
          defaultValues={{
            title: title,
            perms,
          }}
          setVisible={setIsEditing}
          calendarId={calendarId}
          edit={true}
          space={space}
        />
      ) : (
        <Flex
          justifyContent={'space-between'}
          alignItems="center"
          className="highlight-hover"
          style={{
            backgroundColor:
              selectedCalendar === id
                ? 'rgba(var(--rlm-overlay-hover-rgba))'
                : 'transparent',
            borderRadius: '12px',
            padding: '4px 8px',
          }}
          onClick={() => {
            onCalendarSelect(id);
          }}
        >
          <Text.Body fontWeight={500}> {title}</Text.Body>
          <Menu
            orientation="bottom-right"
            id={`menu`}
            fontStyle={'normal'}
            dimensions={{ width: 200, height: 80 }}
            triggerEl={
              <Button.IconButton size={25}>
                <Icon name="MoreHorizontal" size={18} opacity={0.5} />
              </Button.IconButton>
            }
            options={[
              {
                id: `calendar-menu-element-edit`,
                label: 'Edit',
                disabled: false,
                onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.stopPropagation();
                  setIsEditing(true);
                },
              },
              {
                id: `calendar-menu-element-delete`,
                label: 'Delete',
                disabled: false,
                onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.stopPropagation();
                  deleteCalendar(id);
                },
              },
            ]}
          />
        </Flex>
      )}
    </>
  );
};
