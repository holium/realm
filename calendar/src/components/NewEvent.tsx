import { ChangeEvent, useState } from 'react';

import { Button, Flex, Icon, Text, TextInput } from '@holium/design-system';

import { api } from '../api';
import { convertH2M, log } from '../utils';

interface Props {
  datePickerSelected: any;
  selectedCalendar: string;
}
export const NewEvent = ({ selectedCalendar, datePickerSelected }: Props) => {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventDescription, setNewEventDescription] = useState<string>('');
  const [newEventDuration, setNewEventDuration] = useState<number>();

  const createEventBothSingle = async () => {
    if (!startDate || !endDate || !datePickerSelected || !newEventName) return;
    const startDateMinutes = convertH2M(startDate);
    const endDateMinutes = convertH2M(endDate);

    const startDateMS = new Date(
      datePickerSelected.getTime() + startDateMinutes * 60000
    ).getTime();
    const endDateMS = new Date(
      datePickerSelected.getTime() + endDateMinutes * 60000
    ).getTime();
    try {
      log('selectedCalendar', selectedCalendar);
      const result = await api.createSpanBothSingle(
        selectedCalendar,
        startDateMS,
        endDateMS,
        newEventName,
        newEventDescription
      );
      log('createEventBothSingle result =>', result);
    } catch (e) {
      log('createEventBothSingle error =>', e);
    }
    log('startDateMS', startDateMS);
    log('endDateMS', endDateMS);
  };
  const createEventLeftSingle = async () => {
    if (!startDate || !datePickerSelected || !newEventName || !newEventDuration)
      return;
    const startDateMinutes = convertH2M(startDate);

    const startDateMS = new Date(
      datePickerSelected.getTime() + startDateMinutes * 60000
    ).getTime();
    const durationMs = newEventDuration * 60000;
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
  return (
    <>
      <Button.TextButton
        width="100%"
        justifyContent={'center'}
        onClick={() => {
          if (newEventDuration) {
            createEventLeftSingle();
          } else createEventBothSingle();
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
        <Flex alignItems={'center'} gap="10px">
          <TextInput
            id="new-event-duration"
            name="new-event-duration"
            placeholder="Event duration"
            type="number"
            width={'120px'}
            value={newEventDuration?.toString()}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setNewEventDuration(parseInt(evt.target.value));
            }}
          />
          <Text.Body>in minutes (leave empty to use end time)</Text.Body>
        </Flex>
        <Flex gap="10px">
          <label htmlFor="start-time">Start time:</label>
          <input
            type="time"
            id="start-time"
            name="start-time"
            value={startDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setStartDate(e.target.value);
            }}
          />
        </Flex>
        <Flex gap="10px">
          <label htmlFor="end-time">End time:</label>
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
      </Flex>
    </>
  );
};
