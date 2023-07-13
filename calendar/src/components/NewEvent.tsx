import { ChangeEvent, useEffect, useState } from 'react';

import {
  Button,
  Flex,
  Icon,
  Select,
  Text,
  TextInput,
} from '@holium/design-system';

import { api } from '../api';
import {
  addOrdinal,
  addOrdinal2,
  convertH2M,
  getDayOfWeekJS,
  getMonthAndDay,
  getOccurrenceOfDayInMonth,
  log,
} from '../utils';

interface Props {
  datePickerSelected: any;
  selectedCalendar: string;
}
type reccurenceOption = { value: string; label: string };
// TODO: include every (day like today) reccuring event
// TODO: changing timepicker also points at selected date in fullcalendar
export const NewEvent = ({ selectedCalendar, datePickerSelected }: Props) => {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventDescription, setNewEventDescription] = useState<string>('');

  const [selectedReccurenceType, setReccurenceType] =
    useState<string>('noRepeat');
  const [reccurenceTypeOptions, setReccurenceTypeOptions] = useState<
    reccurenceOption[]
  >([
    { value: 'noRepeat', label: 'Dont repeat' },
    { value: 'everyday', label: 'Everyday' },
    { value: 'weekdays', label: 'Week days (mon to fri)' },
    { value: 'weekend', label: 'Weekend (sat-sun)' },
    { value: 'everyToday', label: 'Every (today)' },
    {
      value: 'everyMonth',
      label: 'Monthly on (first/second.... (today) of the month)',
    },
    {
      value: 'everyYearToday',
      label: 'Annually on (whatever date of the month today is)',
    },
  ]);

  useEffect(() => {
    if (datePickerSelected) {
      const weekDay = getDayOfWeekJS(datePickerSelected.getDay()); //sunday,monday...
      const ordinalDayOfMonth =
        addOrdinal(
          getOccurrenceOfDayInMonth(
            datePickerSelected,
            datePickerSelected.getDay()
          )
        ) +
        ' ' +
        getDayOfWeekJS(datePickerSelected.getDay()); //1st sunday, monday of the month...

      const monthAndDay = getMonthAndDay(datePickerSelected);

      const newReccurenceTypeOptions: reccurenceOption[] =
        reccurenceTypeOptions.map((item: reccurenceOption) => {
          if (item.value === 'everyToday') {
            return { ...item, label: 'Every ' + weekDay };
          } else if (item.value === 'everyMonth') {
            return { ...item, label: 'Monthly on the ' + ordinalDayOfMonth };
          } else if (item.value === 'everyYearToday') {
            return { ...item, label: 'Annually on ' + monthAndDay };
          }
          return item;
        }); // add the type
      setReccurenceTypeOptions(newReccurenceTypeOptions);
    }
  }, [datePickerSelected]);
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
      let result;
      if (selectedReccurenceType === 'everyday') {
        result = await api.createSpanPeriodicDaily(
          selectedCalendar,
          startDateMS,
          repeatCountObject,
          timeBetweenEventsEveryday,
          durationMs,
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'weekdays') {
        result = await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          durationMs,
          [0, 1, 2, 3, 4],
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'weekend') {
        result = await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          durationMs,
          [5, 6],
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'everyToday') {
        //on all (selected day of week)
        const selectedWeekDay =
          datePickerSelected.getDay() === 0
            ? 6
            : datePickerSelected.getDay() - 1;

        result = await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          durationMs,
          [selectedWeekDay],
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'everyMonth') {
        //on all (selected day of week)
        const selectedWeekDay =
          datePickerSelected.getDay() === 0
            ? 6
            : datePickerSelected.getDay() - 1;
        const ordinal = addOrdinal2(
          getOccurrenceOfDayInMonth(
            datePickerSelected,
            datePickerSelected.getDay()
          )
        );
        result = await api.createSpanPeriodicMonthlyNthWeekday(
          selectedCalendar,
          startDateMS,
          durationMs,
          ordinal,
          selectedWeekDay,
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'everyYearToday') {
        //on all (current date of month) for however many years
        result = await api.createSpanPeriodicYearlyOnDate(
          selectedCalendar,
          startDateMS,
          durationMs,
          newEventName,
          newEventDescription
        );
      }
      log('createEventPeriodic result =>', result);
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
          else createEventPeriodic();
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
