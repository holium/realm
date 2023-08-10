import { useEffect, useState } from 'react';

import {
  Button,
  Flex,
  Icon,
  Menu,
  Text,
  TextInput,
} from '@holium/design-system';

import { api, Perms } from '../api';
import { copyToClipboard, isOur, log } from '../utils';
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
  publish: boolean;
}

export const CalendarItem = ({
  title,
  id,
  onCalendarSelect,
  selectedCalendar,
  space,
  calendarId,
  perms,
  publish,
}: Props) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newCalendarTitle, setNewCalendarTitle] = useState<string>('');
  const sharedMenuOptions = [
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
  ];
  const menuOptionsPublishOn = [
    ...sharedMenuOptions,
    {
      id: `calendar-menu-element-publish-off`,
      label: 'Disable clearweb access',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        toggleCalendarPublish(false);
      },
    },
    {
      id: `calendar-menu-element-link`,
      label: 'Get clearweb link',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        buildClearWebLink();
      },
    },
  ];
  const menuOptionsPublishOff = [
    ...sharedMenuOptions,
    {
      id: `calendar-menu-element-publish-on`,
      label: 'Enable clearweb access',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        toggleCalendarPublish(true);
      },
    },
  ];
  const [menuOptions, setMenuOptions] = useState<any>([]);
  useEffect(() => {
    log('publish', publish);
    if (publish) {
      setMenuOptions(menuOptionsPublishOn);
    } else {
      setMenuOptions(menuOptionsPublishOff);
    }
  }, [publish]);
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
  const toggleCalendarPublish = async (value: boolean) => {
    try {
      const result = await api.updateCalendar(calendarId, {
        publish: value,
      }); // Only updating title for now
      log('toggleCalendarPublish updateMetadata => ', result);
    } catch (e) {
      log('toggleCalendarPublish error => ', e);
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
  const buildClearWebLink = async () => {
    try {
      const result = await api.getCurrentLink();
      // append the path to the app and the calendar
      const shareableLink = result + '/apps/calendar/public/' + calendarId;
      copyToClipboard(shareableLink);
      log('shareableLink => ', shareableLink);
    } catch (e) {
      log('buildClearWebLink error => ', e);
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
            dimensions={{ width: 200, height: publish ? 150 : 120 }}
            triggerEl={
              <Button.IconButton size={25}>
                <Icon name="MoreHorizontal" size={18} opacity={0.5} />
              </Button.IconButton>
            }
            options={menuOptions}
          />
        </Flex>
      )}
    </>
  );
};
