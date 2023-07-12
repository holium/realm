import { ChangeEvent, useState } from 'react';

import {
  Button,
  Flex,
  Icon,
  Select,
  Text,
  TextInput,
} from '@holium/design-system';

import { api } from '../api';
import { convertH2M, log } from '../utils';

interface Props {
  datePickerSelected: any;
  selectedCalendar: string;
}
// TODO: include every (day like today) reccuring event
// TODO: changing timepicker also points at selected date in fullcalendar
export const NewEvent = ({ selectedCalendar, datePickerSelected }: Props) => {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventDescription, setNewEventDescription] = useState<string>('');

  const [selectedReccurenceType, setReccurenceType] =
    useState<string>('noRepeat');
  const reccurenceTypeOptions = [
    { value: 'noRepeat', label: 'Dont repeat' },
    { value: 'everyday', label: 'Everyday' },
    { value: 'weekdays', label: 'Week days (mon to fri)' },
    { value: 'weekend', label: 'Weekend (sat-sun)' },
    { value: 'everyToday', label: 'Every (today)' },
  ];

  const createEventLeftSingle = async () => {
    if (!startDate || !endDate || !datePickerSelected || !newEventName) return;
    const startDateMinutes = convertH2M(startDate);
    const endDateMinutes = convertH2M(endDate);
    const startDateMS = new Date(
      datePickerSelected.getTime() + startDateMinutes * 60000
    ).getTime();
    const durationMs = Math.abs(endDateMinutes - startDateMinutes) * 60000; // TODO: if endDate < startDate we have a problem
    try {
      log('selectedCalendar', selectedCalendar);
      const result = await api.createSpanLeftSingle(
        selectedCalendar,
        startDateMS,
        durationMs,
        newEventName,
        newEventDescription
      );
      log('createEventLeftSingle result =>', result);
    } catch (e) {
      log('createEventLeftSingle error =>', e);
    }
  };
  const createEventPeriodic = async () => {
    if (!startDate || !endDate || !datePickerSelected || !newEventName) return;
    const startDateMinutes = convertH2M(startDate);
    const endDateMinutes = convertH2M(endDate);

    const startDateMS = new Date(
      datePickerSelected.getTime() + startDateMinutes * 60000
    ).getTime();

    const repeatCountObject = { l: 0, r: 9 };
    const timeBetweenEventsEveryday = 1 * 60 * 60 * 24 * 1000; //1 is the number of days

    const durationMs = Math.abs(endDateMinutes - startDateMinutes) * 60000; // TODO: if endDate < startDate we have a problem
    try {
      if (selectedReccurenceType === 'everyday') {
        await api.createSpanPeriodicDaily(
          selectedCalendar,
          startDateMS,
          repeatCountObject,
          timeBetweenEventsEveryday,
          durationMs,
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'weekdays') {
        await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          durationMs,
          [0, 1, 2, 3, 4],
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'weekend') {
        await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          durationMs,
          [5, 6],
          newEventName,
          newEventDescription
        );
      }
      log('createEventPeriodic result =>');
    } catch (e) {
      log('createEventPeriodic error =>', e);
    }
  };

  return (
    <>
      <Button.TextButton
        width="100%"
        justifyContent={'center'}
        onClick={() => {
          log('selectedReccurenceType', selectedReccurenceType);
          if (selectedReccurenceType === 'noRepeat') createEventLeftSingle();
          else if (selectedReccurenceType === 'everyday') createEventPeriodic();
        }}
      >
        <Icon name="Plus" size={24} opacity={0.5} />
        New event
      </Button.TextButton>

      <Flex
        flexDirection={'column'}
        gap="20px"
        marginTop="20px"
        marginBottom={'20px'}
      >
        <TextInput
          id="new-event-name"
          name="new-event-name"
          placeholder="Event name"
          value={newEventName}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewEventName(evt.target.value);
          }}
        />
        <TextInput
          id="new-event-description"
          name="new-event-description"
          placeholder="Event description"
          value={newEventDescription}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewEventDescription(evt.target.value);
          }}
        />

        <Flex gap="5px" alignItems={'center'}>
          <Text.Label fontWeight={600}>
            {datePickerSelected?.toDateString().slice(0, -4)}
          </Text.Label>
          <input
            type="time"
            id="start-time"
            name="start-time"
            value={startDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setStartDate(e.target.value);
            }}
          />
          <Text.Body>{'-'}</Text.Body>
          <input
            type="time"
            id="end-time"
            name="end-time"
            value={endDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEndDate(e.target.value);
            }}
          />
        </Flex>
        <Select
          id="reccurence-type-select"
          options={reccurenceTypeOptions}
          selected={selectedReccurenceType}
          onClick={(type) => {
            setReccurenceType(type as string);
          }}
        />
      </Flex>
    </>
  );
};
