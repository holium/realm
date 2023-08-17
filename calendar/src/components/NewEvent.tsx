import { ChangeEvent, useEffect, useState } from 'react';

import {
  Box,
  Button,
  CheckBox,
  Flex,
  Icon,
  Select,
  Text,
  TextInput,
} from '@holium/design-system';

import { api } from '../api';
import useCalendarStore, { CalendarStore } from '../CalendarStore';
import {
  addOrdinal,
  addOrdinal2,
  convertDateToHHMM,
  convertH2M,
  formatDateToYYYYMMDD,
  getDayOfWeekJS,
  getMonthAndDay,
  getOccurrenceOfDayInMonth,
  isDateValidInYear,
  log,
  reccurenceRuleParse,
  reccurenceTypeOptionsDS,
  toUTCDate,
} from '../utils';
const colors = [
  {
    id: '1',
    backgroundColor: 'rgb(63, 81, 181)',
  },
  {
    id: '2',
    backgroundColor: 'rgb(213, 0, 0)',
  },
  {
    id: '3',
    backgroundColor: 'rgb(244, 81, 30)',
  },
  {
    id: '4',
    backgroundColor: 'rgb(51, 182, 121)',
  },
  {
    id: '5',
    backgroundColor: 'rgb(3, 155, 229)',
  },
  {
    id: '6',
    backgroundColor: 'rgb(121, 134, 203)',
  },
  {
    id: '7',
    backgroundColor: 'rgb(97, 97, 97)',
  },

  {
    id: '9',
    backgroundColor: 'rgb(230, 124, 115)',
  },
  {
    id: '10',
    backgroundColor: 'rgb(246, 191, 38)',
  },
  {
    id: '11',
    backgroundColor: 'rgb(11, 128, 67)',
  },
  {
    id: '12',
    backgroundColor: 'rgb(142, 36, 170)',
  },
];

interface Props {
  datePickerSelected: any;
  selectedCalendar: string;
  setDatePickerValue: (date: Date) => void;
}
type selectOptions = { value: string; label: string };
export const NewEvent = ({
  selectedCalendar,
  datePickerSelected,
  setDatePickerValue,
}: Props) => {
  const [selectedBackgroundColor, setSelectedBackground] = useState<string>('');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventDescription, setNewEventDescription] = useState<string>('');
  const [selectedReccurenceType, setReccurenceType] =
    useState<string>('noRepeat');
  const [reccurenceTypeOptions, setReccurenceTypeOptions] = useState<
    selectOptions[]
  >(reccurenceTypeOptionsDS);

  const [reccurentEndDate, setReccurentEndDate] = useState<string>(
    formatDateToYYYYMMDD(new Date())
  );
  const [isFullDay, setIsFullDay] = useState<boolean>(false);

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
      // Update end of event date picker to reflected datePickerSelected
      setReccurentEndDate(formatDateToYYYYMMDD(datePickerSelected));
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
        newEventDescription,
        selectedBackgroundColor
      );
      log('createEventLeftSingle result =>', result);
    } catch (e) {
      log('createEventLeftSingle error =>', e);
    }
  };
  const createEventFullDaySingle = async () => {
    if (!datePickerSelected || !newEventName) return;

    const startDateMS = toUTCDate(datePickerSelected).getTime();
    try {
      const result = await api.createSpanFullDaySingle(
        selectedCalendar,
        startDateMS,
        newEventName,
        newEventDescription,
        selectedBackgroundColor
      );
      log('createEventLeftSingle result =>', result);
    } catch (e) {
      log('createEventLeftSingle error =>', e);
    }
  };

  const createEventPeriodic = async () => {
    if (
      !startDate ||
      !endDate ||
      !datePickerSelected ||
      !newEventName ||
      !reccurentEndDate
    )
      return;
    const startDateMinutes = convertH2M(startDate);
    const endDateMinutes = convertH2M(endDate);

    const startDateMS = new Date(
      datePickerSelected.getTime() + startDateMinutes * 60000
    ).getTime();
    const endDateMS = toUTCDate(new Date(reccurentEndDate)).getTime();
    const timeBetweenEventsEveryday = 1 * 60 * 60 * 24 * 1000; //1 is the number of days

    const durationMs = Math.abs(endDateMinutes - startDateMinutes) * 60000; // TODO: if endDate < startDate we have a problem
    try {
      let result;
      if (selectedReccurenceType === 'everyday') {
        result = await api.createSpanPeriodicDaily(
          selectedCalendar,
          startDateMS,
          endDateMS,
          timeBetweenEventsEveryday,
          durationMs,
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      } else if (selectedReccurenceType === 'weekdays') {
        result = await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          endDateMS,
          durationMs,
          [0, 1, 2, 3, 4],
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      } else if (selectedReccurenceType === 'weekend') {
        result = await api.createSpanPeriodicWeekly(
          selectedCalendar,
          startDateMS,
          endDateMS,
          durationMs,
          [5, 6],
          newEventName,
          newEventDescription,
          selectedBackgroundColor
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
          endDateMS,
          durationMs,
          [selectedWeekDay],
          newEventName,
          newEventDescription,
          selectedBackgroundColor
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
          endDateMS,
          durationMs,
          ordinal,
          selectedWeekDay,
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      } else if (selectedReccurenceType === 'everyYearToday') {
        //on all (current date of month) for however many years
        result = await api.createSpanPeriodicYearlyOnDate(
          selectedCalendar,
          startDateMS,
          endDateMS,
          durationMs,
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      }
      log('createEventPeriodic result =>', result);
    } catch (e) {
      log('createEventPeriodic error =>', e);
    }
  };
  const createEventFullDayPeriodic = async () => {
    if (!datePickerSelected || !newEventName || !reccurentEndDate) return;

    const startDateMS = toUTCDate(datePickerSelected).getTime();
    const endDateMS = toUTCDate(new Date(reccurentEndDate)).getTime();

    const timeBetweenEventsEveryday = 1 * 60 * 60 * 24 * 1000; //1 is the number of days

    try {
      let result;
      if (selectedReccurenceType === 'everyday') {
        result = await api.createSpanPeriodicFullDayDaily(
          selectedCalendar,
          startDateMS,
          endDateMS,
          timeBetweenEventsEveryday,
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      } else if (selectedReccurenceType === 'weekdays') {
        result = await api.createSpanPeriodicFullDayWeekly(
          selectedCalendar,
          startDateMS,
          endDateMS,
          [0, 1, 2, 3, 4],
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      } else if (selectedReccurenceType === 'weekend') {
        result = await api.createSpanPeriodicFullDayWeekly(
          selectedCalendar,
          startDateMS,
          endDateMS,
          [5, 6],
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      } else if (selectedReccurenceType === 'everyToday') {
        //on all (selected day of week)
        const selectedWeekDay =
          datePickerSelected.getDay() === 0
            ? 6
            : datePickerSelected.getDay() - 1;

        result = await api.createSpanPeriodicFullDayWeekly(
          selectedCalendar,
          startDateMS,
          endDateMS,
          [selectedWeekDay],
          newEventName,
          newEventDescription,
          selectedBackgroundColor
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
        result = await api.createSpanPeriodicFullDayMonthlyNthWeekday(
          selectedCalendar,
          startDateMS,
          endDateMS,
          ordinal,
          selectedWeekDay,
          newEventName,
          newEventDescription,
          selectedBackgroundColor
        );
      } else if (selectedReccurenceType === 'everyYearToday') {
        //on all (current date of month) for however many years
        result = await api.createSpanPeriodicFullDayYearlyOnDate(
          selectedCalendar,
          startDateMS,
          endDateMS,
          newEventName,
          newEventDescription,
          selectedBackgroundColor
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

  const isEditingInstance = useCalendarStore(
    (store: CalendarStore) => store.isEditingInstance
  );
  const setIsEditingInstance = useCalendarStore(
    (store: CalendarStore) => store.setIsEditingInstance
  );

  const editingData = useCalendarStore(
    (store: CalendarStore) => store.editingData
  );
  const setEditingData = useCalendarStore(
    (store: CalendarStore) => store.setEditingData
  );
  useEffect(() => {
    if (editingData) {
      // Update the state with the given editingData
      setNewEventName(editingData.title);
      setNewEventDescription(editingData.description);
      setStartDate(convertDateToHHMM(editingData.startDate)); // TODO: is it bad to set this if it's a fullday event?
      editingData.endDate && setEndDate(convertDateToHHMM(editingData.endDate));

      setIsFullDay(editingData.isFullDay);
      const reccurenceTypeOption = reccurenceRuleParse(
        editingData.reccurenceRule
      ).reccurenceTypeOption;
      setReccurenceType(reccurenceTypeOption);
      // endDate is not just the time, it's also the end of reccurent event date
      if (reccurenceTypeOption !== 'noRepeat') {
        editingData.endDate &&
          setReccurentEndDate(formatDateToYYYYMMDD(editingData.endDate));
      }
      // TODO: start an end date values aren't for the entire event just for the passed instance??
      editingData.endDate && setDatePickerValue(editingData.endDate);
    }
  }, [editingData]);
  const resetState = () => {
    setNewEventName('');
    setNewEventDescription('');
    // TODO: values for time input don't reset, find a fix
    setStartDate(undefined);
    setEndDate(undefined);
    setIsFullDay(false);
    setReccurenceType('noRepeat');
    setReccurentEndDate(formatDateToYYYYMMDD(new Date()));
    setDatePickerValue(new Date());
  };
  return (
    <>
      <Flex gap="5px" height="30px">
        {isEditingInstance ? (
          <>
            <Button.Transparent
              fontWeight={600}
              onClick={() => {
                setIsEditingInstance(false);
                setEditingData(null);
                resetState();
              }}
            >
              Cancel
            </Button.Transparent>
            <Button.TextButton
              width="100%"
              justifyContent={'center'}
              onClick={() => {
                log('selectedReccurenceType', selectedReccurenceType);
                if (selectedReccurenceType === 'noRepeat') {
                  isFullDay
                    ? createEventFullDaySingle()
                    : createEventLeftSingle();
                } else
                  isFullDay
                    ? createEventFullDayPeriodic()
                    : createEventPeriodic();
              }}
              fontWeight={600}
            >
              <Icon name="Edit" size={22} opacity={0.7} />
              Edit event
            </Button.TextButton>
          </>
        ) : (
          <Button.TextButton
            width="100%"
            justifyContent={'center'}
            onClick={() => {
              log('selectedReccurenceType', selectedReccurenceType);
              if (selectedReccurenceType === 'noRepeat') {
                isFullDay
                  ? createEventFullDaySingle()
                  : createEventLeftSingle();
              } else
                isFullDay
                  ? createEventFullDayPeriodic()
                  : createEventPeriodic();
            }}
            fontWeight={600}
          >
            <Icon name="Plus" size={24} opacity={0.7} />
            New event
          </Button.TextButton>
        )}
      </Flex>

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
        {!isFullDay && (
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
        )}
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
            </Flex>
          </Flex>
        )}
        <CheckBox
          label="Fullday event"
          isChecked={isFullDay}
          onChange={setIsFullDay}
        />

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
                setSelectedBackground('');
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
