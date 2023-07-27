import { useState } from 'react';

// TODO: install this (peerdep?)
import {
  Box,
  Button,
  Flex,
  Icon,
  SectionDivider,
  TextInput,
} from '@holium/design-system';

import { api } from '../api';
import { isOur, log } from '../utils';
import { CalendarItem } from './CalendarItem';
import { CalendarPerms } from './CalendarPerms';

interface Props {
  calendarList: any;
  onCalendarSelect: (id: string) => void;
  selectedCalendar: null | string;
  space: string;
}
export const CalendarList = ({
  calendarList,
  onCalendarSelect,
  selectedCalendar,
  space,
}: Props) => {
  const [newCalendar, setNewCalendar] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const addCalendarOur = async () => {
    try {
      const result = await api.createCalendarOur(newCalendar);

      log('addCalendarOur result => ', result);
    } catch (e) {
      log('addCalendarOur error => ', e);
    }
  };

  return (
    <>
      <Flex alignItems={'center'}>
        <Box flex={1}>
          <SectionDivider label="My Calendars" alignment="left" />
        </Box>
        <Flex flex={0.15} justifyContent={'center'} alignItems={'center'}>
          <Button.IconButton
            className="realm-cursor-hover"
            size={26}
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(!isAdding);
            }}
          >
            <Icon name="Plus" size={24} opacity={0.5} />
          </Button.IconButton>
        </Flex>
      </Flex>
      <Flex
        flexDirection={'column'}
        gap={'10px'}
        marginTop={'20px'}
        marginBottom={'20px'}
      >
        {calendarList.map((item: any, index: number) => {
          return (
            <CalendarItem
              key={'calendar-' + index}
              id={item.id}
              title={item.title}
              description={item.description}
              perms={item.perms}
              onCalendarSelect={onCalendarSelect}
              selectedCalendar={selectedCalendar}
              space={space}
              calendarId={item.id}
            />
          );
        })}
        {isAdding &&
          (isOur(space) ? (
            <TextInput
              id="new-calendar-input"
              name="new-calendar-input"
              autoFocus
              placeholder="New calendar"
              value={newCalendar}
              onKeyDown={(evt: any) => {
                if (evt.key === 'Enter' && newCalendar.length > 0) {
                  addCalendarOur();
                }
                // Hitting escape closes the inpu
                if (evt.key === 'Escape') {
                  setIsAdding(false);
                }
              }}
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                setNewCalendar(evt.target.value);
              }}
              //    onBlur={() => setIsAdding(false)}
            />
          ) : (
            <CalendarPerms
              setVisible={setIsAdding}
              edit={false}
              calendarId={null}
              space={space}
            />
          ))}
      </Flex>
    </>
  );
};
