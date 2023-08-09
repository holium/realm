import { useState } from 'react';

import {
  Button,
  Flex,
  Icon,
  Menu,
  Text,
  TextInput,
} from '@holium/design-system';

import { api, Perms } from '../api';
import { isOur, log } from '../utils';
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
  const [newCalendarTitle, setNewCalendarTitle] = useState<string>('');
  const updateCalendar = async () => {
    if (!calendarId) return;
    if (!newCalendarTitle) return; // TODO: should be called newTitle?
    try {
      const updateMetadata = await api.updateCalendar(calendarId, {
        title: newCalendarTitle,
      }); // Only updating title for now
      log('updateCalendar updateMetadata => ', updateMetadata);
    } catch (e) {
      log('updateCalendar error => ', e);
    }
  };
  const deleteCalendar = async (id: string) => {
    try {
      const result = await api.deleteCalendar(space, id);

      log('deleteCalendar result => ', result);
    } catch (e) {
      log('deleteCalendar error => ', e);
    }
  };

  const renderEditing = () => {
    if (isOur(space)) {
      return (
        <TextInput
          id="new-calendar-input"
          name="new-calendar-input"
          autoFocus
          placeholder="New calendar"
          value={newCalendarTitle}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewCalendarTitle(evt.target.value);
          }}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter' && newCalendarTitle.length > 0) {
              updateCalendar();
            } else if (evt.key === 'Escape') {
              setIsEditing(false);
            }
          }}
        />
      );
    } else {
      return (
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
      );
    }
  };
  return (
    <>
      {isEditing ? (
        renderEditing()
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
                  setNewCalendarTitle(title);
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
