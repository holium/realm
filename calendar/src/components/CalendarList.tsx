import { useState } from 'react';

import {
  Box,
  Button,
  Flex,
  Icon,
  SectionDivider,
  TextInput,
} from '@holium/design-system';

import { api } from '../api';
import { log } from '../utils';
import { CalendarItem } from './CalendarItem';
interface Props {
  calendarList: any;
  onCalendarSelect: (id: string) => void;
  selectedCalendar: null | string;
}
export const CalendarList = ({
  calendarList,
  onCalendarSelect,
  selectedCalendar,
}: Props) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const addCalendar = async (newCalendar: string) => {
    try {
      const result = await api.createCalendar(newCalendar);
      log('addCalendar result => ', result);
    } catch (e) {
      log('addCalendar error => ', e);
    }
  };
  const [newCalendar, setNewCalendar] = useState<string>('');

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
              title={item.title}
              description={item.description}
              id={item.id}
              onCalendarSelect={onCalendarSelect}
              selectedCalendar={selectedCalendar}
            />
          );
        })}
        {isAdding && (
          <TextInput
            id="new-calendar-input"
            name="new-calendar-input"
            tabIndex={1}
            autoFocus
            placeholder="New calendar"
            value={newCalendar}
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter' && newCalendar.length > 0) {
                addCalendar(newCalendar);
              }
              // Hitting escape closes the inpu
              if (evt.key === 'Escape') {
                setIsAdding(false);
              }
            }}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setNewCalendar(evt.target.value);
            }}
            onBlur={() => setIsAdding(false)}
          />
        )}
      </Flex>
    </>
  );
};
