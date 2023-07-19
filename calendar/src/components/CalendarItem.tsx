import { useState } from 'react';

import {
  Button,
  Flex,
  Icon,
  Menu,
  Text,
  TextInput,
} from '@holium/design-system';

import { api } from '../api';
import { log } from '../utils';

interface Props {
  title: string;
  description: string;
  id: string;
  onCalendarSelect: (id: string) => void;
  selectedCalendar: null | string;
}

export const CalendarItem = ({
  title,
  id,
  onCalendarSelect,
  selectedCalendar,
}: Props) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const deleteCalendar = async (id: string) => {
    try {
      const result = await api.deleteCalendar(id);

      log('deleteCalendar result => ', result);
    } catch (e) {
      log('deleteCalendar error => ', e);
    }
  };
  const editCalendar = async (newTitle: string, id: string) => {
    setIsEditing(false);
    try {
      log(newTitle, id);
    } catch (e) {
      log(newTitle, id);
    }
  };
  return (
    <>
      {isEditing ? (
        <TextInput
          id="edit-calendar-input"
          name="edit-calendar-input"
          tabIndex={1}
          autoFocus
          placeholder="New calendar title"
          value={newTitle}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter' && newTitle.length > 0) {
              editCalendar(newTitle, id);
            }
            // Hitting escape closes the inpu
            if (evt.key === 'Escape') {
              setIsEditing(false);
            }
          }}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewTitle(evt.target.value);
          }}
          onBlur={() => setIsEditing(false)}
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
                  setNewTitle(title);
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
