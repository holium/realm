import { ChangeEvent, useState } from 'react';

import {
  Button,
  Flex,
  Icon,
  RadioGroup,
  Text,
  TextInput,
} from '@holium/design-system';

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
  const [everyXDay, setEveryXDay] = useState<number>();
  const [repeatCount, setRepeatCount] = useState<number>();
  const [selectedEventType, setSelectedEventType] =
    useState<string>('single left');

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
  const createEventPeriodic = async () => {
    if (
      !startDate ||
      !datePickerSelected ||
      !newEventName ||
      !newEventDuration ||
      !repeatCount ||
      !everyXDay
    )
      return;
    const startDateMinutes = convertH2M(startDate);

    const startDateMS = new Date(
      datePickerSelected.getTime() + startDateMinutes * 60000
    ).getTime();

    const repeatCountObject = { l: 0, r: repeatCount - 1 };
    const timeBetweenEvents = everyXDay * 60 * 60 * 24 * 1000;
    const durationMs = newEventDuration * 60000; // minutes => unix ms
    try {
      log(
        selectedCalendar,
        startDateMS,
        repeatCountObject,
        timeBetweenEvents,
        durationMs,
        newEventName,
        newEventDescription
      );
      const result = await api.createSpanPeriodic(
        selectedCalendar,
        startDateMS,
        repeatCountObject,
        timeBetweenEvents,
        durationMs,
        newEventName,
        newEventDescription
      );
      log('createEventPeriodic result =>', result);
    } catch (e) {
      log('createEventPeriodic error =>', e);
    }
  };
  const renderEventLeftSingle = () => {
    return (
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
          <Text.Body>in minutes</Text.Body>
        </Flex>
      </Flex>
    );
  };
  const renderEventBothSingle = () => {
    return (
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
    );
  };
  const renderEventPeriodic = () => {
    return (
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
          <Text.Body>in minutes</Text.Body>
        </Flex>
        <Flex gap="10px">
          <label htmlFor="end-time">repeat x times:</label>
          <input
            type="number"
            id="repeat-count"
            name="repeat-count"
            value={repeatCount?.toString()}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setRepeatCount(parseInt(e.target.value));
            }}
          />
        </Flex>
        <Flex gap="10px">
          <label htmlFor="end-time">every x day:</label>
          <input
            type="number"
            id="every-x-day"
            name="every-x-day"
            value={everyXDay?.toString()}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEveryXDay(parseInt(e.target.value));
            }}
          />
        </Flex>
      </Flex>
    );
  };
  return (
    <>
      <RadioGroup
        selected={selectedEventType}
        options={[
          { label: 'single left', value: 'single left' },
          { label: 'double left', value: 'double left' },
          { label: 'periodic', value: 'periodic' },
        ]}
        onClick={(value: string) => {
          setSelectedEventType(value);
        }}
      />
      <Button.TextButton
        width="100%"
        justifyContent={'center'}
        onClick={() => {
          if (selectedEventType === 'single left') {
            createEventLeftSingle();
          } else if (selectedEventType === 'double left')
            createEventBothSingle();
          else if (selectedEventType === 'periodic') {
            createEventPeriodic();
          }
        }}
      >
        <Icon name="Plus" size={24} opacity={0.5} />
        New event
      </Button.TextButton>

      {selectedEventType === 'single left' && renderEventLeftSingle()}
      {selectedEventType === 'double left' && renderEventBothSingle()}
      {selectedEventType === 'periodic' && renderEventPeriodic()}
    </>
  );
};
