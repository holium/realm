import { ChangeEvent, useEffect, useState } from 'react';

import {
  Box,
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
  countDaysBetweenDates,
  countNthWeekdaysBetweenDates,
  countWeekDayOccurenceBetweenDates,
  countWeekdaysBetweenDates,
  countWeekendsBetweenDates,
  formatDateToYYYYMMDD,
  getDayOfWeekJS,
  getMonthAndDay,
  getOccurrenceOfDayInMonth,
  isDateValidInYear,
  log,
} from '../utils';
const colors = [
  {
    id: '1',
    backgroundColor: '#a4bdfc',
  },
  {
    id: '2',
    backgroundColor: '#7ae7bf',
  },
  {
    id: '3',
    backgroundColor: '#dbadff',
  },
  {
    id: '4',
    backgroundColor: '#ff887c',
  },
  {
    id: '5',
    backgroundColor: '#fbd75b',
  },
  {
    id: '6',
    backgroundColor: '#ffb878',
  },
  {
    id: '7',
    backgroundColor: '#46d6db',
  },

  {
    id: '9',
    backgroundColor: '#5484ed',
  },
  {
    id: '10',
    backgroundColor: '#51b749',
  },
  {
    id: '11',
    backgroundColor: '#dc2127',
  },
];

interface Props {
  datePickerSelected: any;
  selectedCalendar: string;
}
type selectOptions = { value: string; label: string };
// TODO: changing timepicker also points at selected date in fullcalendar and vice versa
export const NewEvent = ({ selectedCalendar, datePickerSelected }: Props) => {
  const [selectedBackgroundColor, setSelectedBackground] = useState<
    null | string
  >(null);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventDescription, setNewEventDescription] = useState<string>('');
  const [selectedReccurenceType, setReccurenceType] =
    useState<string>('noRepeat');
  const [reccurenceTypeOptions, setReccurenceTypeOptions] = useState<
    selectOptions[]
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

  const [reccurentEndDate, setReccurentEndDate] = useState<string>(
    formatDateToYYYYMMDD(new Date())
  );
  const [reccurentRepTime, setReccurentRepTime] = useState<number>(0);

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

      const newReccurenceTypeOptions: selectOptions[] =
        reccurenceTypeOptions.map((item: selectOptions) => {
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

    const repeatCountObject = { l: 0, r: reccurentRepTime - 1 };
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
          repeatCountObject,
          durationMs,
          [0, 1, 2, 3, 4],
          newEventName,
          newEventDescription
        );
      } else if (selectedReccurenceType === 'weekend') {
        result = await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          repeatCountObject,
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
          repeatCountObject,
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
          repeatCountObject,
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
          repeatCountObject,
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

  const [reccurenceEndYearOptions, setReccurentEndYearOptions] = useState<
    selectOptions[]
  >([]);
  const [selectedEndYearOption, setSelectedEndYearOption] = useState<string>(
    new Date().getFullYear().toString()
  );
  useEffect(() => {
    // generate select options for end year select, do it every time datePickerSelected changes
    if (datePickerSelected) {
      setReccurentEndYearOptions(generateYearsOptions(datePickerSelected));
    }
  }, [datePickerSelected]);
  const generateYearsOptions = (
    startDate: Date,
    years = 10
  ): selectOptions[] => {
    const startYear = startDate.getFullYear();
    const newYearOptions: selectOptions[] = [];
    const selectedMonth = datePickerSelected.getMonth();
    const selectedDay = datePickerSelected.getDate();
    for (let i = startYear; i < startYear + years; i++) {
      // Check if a date exists on that year
      if (!isDateValidInYear(i, selectedMonth, selectedDay)) continue;

      newYearOptions.push({ value: i.toString(), label: i.toString() });
    }
    return newYearOptions;
  };
  useEffect(() => {
    if (reccurentEndDate) {
      if (selectedReccurenceType === 'everyday') {
        const newReccurentRepTime = countDaysBetweenDates(
          datePickerSelected,
          reccurentEndDate
        );
        setReccurentRepTime(newReccurentRepTime);
      } else if (selectedReccurenceType === 'weekdays') {
        const newReccurentRepTime = countWeekdaysBetweenDates(
          datePickerSelected,
          reccurentEndDate
        );
        setReccurentRepTime(newReccurentRepTime);
      } else if (selectedReccurenceType === 'weekend') {
        const newReccurentRepTime = countWeekendsBetweenDates(
          datePickerSelected,
          reccurentEndDate
        );
        setReccurentRepTime(newReccurentRepTime);
      } else if (selectedReccurenceType === 'everyToday') {
        const newReccurentRepTime = countWeekDayOccurenceBetweenDates(
          datePickerSelected,
          reccurentEndDate,
          datePickerSelected.getDay()
        );
        setReccurentRepTime(newReccurentRepTime);
      } else if (selectedReccurenceType === 'everyMonth') {
        const nthOccurence = getOccurrenceOfDayInMonth(
          datePickerSelected,
          datePickerSelected.getDay()
        );
        log('nthOccurence', nthOccurence);
        const newReccurentRepTime = countNthWeekdaysBetweenDates(
          datePickerSelected,
          reccurentEndDate,
          datePickerSelected.getDay(),
          nthOccurence
        );
        setReccurentRepTime(newReccurentRepTime);
      } else if (selectedReccurenceType === 'everyYearToday') {
        const newReccurentRepTime =
          1 +
          parseInt(selectedEndYearOption) -
          datePickerSelected.getFullYear();
        setReccurentRepTime(newReccurentRepTime);
      }
    }
  }, [
    reccurentEndDate,
    selectedEndYearOption,
    selectedReccurenceType,
    datePickerSelected,
  ]);

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
          id="new-event-reccurent-end-date"
          name="new-event-reccurent-end-date"
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
        {selectedReccurenceType !== 'noRepeat' &&
          selectedReccurenceType !== 'everyYearToday' && (
            <Flex alignItems={'center'} gap="10px">
              <Text.Label fontWeight={600}>End of event</Text.Label>
              <input
                type="date"
                id="reccurent-event-end-date"
                name="reccurent-event-end-date"
                min={formatDateToYYYYMMDD(new Date())}
                value={reccurentEndDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setReccurentEndDate(e.target.value);
                }}
                style={{ maxWidth: 100 }}
              />
            </Flex>
          )}
        {selectedReccurenceType === 'everyYearToday' && (
          <Flex flexDirection={'column'} gap="10px">
            <Text.Body fontWeight={600}>End of reccurent event</Text.Body>
            <Flex flexDirection={'row'} gap="10px" alignItems={'center'}>
              <Select
                id="reccurence-end-year-select"
                options={reccurenceEndYearOptions}
                selected={selectedEndYearOption}
                onClick={(type) => {
                  setSelectedEndYearOption(type as string);
                }}
              />
              <Text.Body fontWeight={600}>{reccurentRepTime}</Text.Body>
            </Flex>
          </Flex>
        )}
        <Flex>
          <Select
            id="reccurence-type-select"
            options={reccurenceTypeOptions}
            selected={selectedReccurenceType}
            onClick={(type) => {
              setReccurenceType(type as string);
            }}
          />
        </Flex>
        <Flex>
          {' '}
          <Flex flexWrap="wrap" gap="3px" maxWidth={300}>
            <Box
              style={{
                boxSizing: 'border-box',
                backgroundColor: 'rgba(var(--rlm-accent-rgba))',
                border: !selectedBackgroundColor ? '2px solid black' : 'none',
              }}
              key={'swatch-rlm-accent'}
              height="30px"
              width="30px"
              borderRadius={5}
              onClick={() => {
                setSelectedBackground(null);
              }}
            />
            {colors.map((item: any, index: number) => {
              return (
                <Box
                  style={{
                    boxSizing: 'border-box',
                    backgroundColor: item.backgroundColor,
                    border:
                      selectedBackgroundColor === item.backgroundColor
                        ? '2px solid black'
                        : 'none',
                  }}
                  key={'swatch-' + index}
                  height="30px"
                  width="30px"
                  borderRadius={5}
                  onClick={() => {
                    setSelectedBackground(item.backgroundColor);
                  }}
                />
              );
            })}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
