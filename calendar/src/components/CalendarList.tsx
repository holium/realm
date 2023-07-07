import { useState } from 'react';

import {
  Box,
  Button,
  Flex,
  Icon,
  SectionDivider,
  Text,
  TextInput,
} from '@holium/design-system';

import { api } from '../api';
import { log } from '../utils';
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
              log('adding calendar');
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
        {calendarList.map((item: any, key: number) => {
          return (
            <Box
              key={'calendar-' + key}
              className="highlight-hover"
              style={{
                backgroundColor:
                  selectedCalendar === item.id
                    ? 'rgba(var(--rlm-overlay-hover-rgba))'
                    : 'transparent',
                borderRadius: '12px',
                padding: '4px 8px',
              }}
              onClick={() => {
                onCalendarSelect(item.id);
              }}
            >
              <Text.Body fontWeight={600}> {item.title}</Text.Body>
            </Box>
          );
        })}
        <TextInput
          id="new-calendar-input"
          name="new-calendar-input"
          tabIndex={1}
          width="100%"
          placeholder="New calendar"
          value={newCalendar}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter' && newCalendar.length > 0) {
              addCalendar(newCalendar);
            }
          }}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewCalendar(evt.target.value);
          }}
        />
      </Flex>
    </>
  );
};
