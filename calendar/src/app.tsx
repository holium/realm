import { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

import { Button, Flex } from '@holium/design-system';

import { api } from './api';
import {
  Calendar,
  CalendarList,
  DatePicker,
  NewEvent,
  SpaceList,
} from './components';
import { isOur, log } from './utils';

import 'react-day-picker/dist/style.css';

const GlobalStyle = createGlobalStyle`
  html { 
    overflow: hidden;
    font-family: var(--rlm-font);
    background: rgba(var(--rlm-window-rgba));

  }
  .highlight-hover:hover {
    background-color: rgba(var(--rlm-overlay-hover-rgba));
    cursor: pointer;
  }
  .highlight-hover:focus {
    background-color: rgba(var(--rlm-overlay-hover-rgba));
    transition: '.25s ease';
    outline: none;
  }

    :root {
      --background-image: url(https\:\/\/images\.unsplash\.com\/photo-1636408807362-a6195d3dd4de\?ixlib\=rb-1\.2\.1\&ixid\=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8\&auto\=format\&fit\=crop\&w\=3264\&q\=80);
      --theme-mode: light;
      --rlm-font: "Rubik",sans-serif;
      --blur: blur(24px);
      --transition-fast: all 0.25s ease;
      --transition: 0.4s ease;
      --transition-2x: all 0.5s ease;
      --rlm-border-radius-4: 4px;
      --rlm-border-radius-6: 6px;
      --rlm-border-radius-9: 9px;
      --rlm-border-radius-12: 12px;
      --rlm-border-radius-16: 16px;
      --rlm-box-shadow-1: 0px 0px 4px rgba(0,0,0,0.06);
      --rlm-box-shadow-2: 0px 0px 9px rgba(0,0,0,0.12);
      --rlm-box-shadow-3: 0px 0px 9px rgba(0,0,0,0.18);
      --rlm-box-shadow-lifted: 0px 0px 9px rgba(0,0,0,0.24);
      --rlm-home-button-rgba: 201,201,184,0.5;
      --rlm-dock-rgba: 240,240,237,0.65;
      --rlm-base-rgba: 217,218,208;
      --rlm-accent-rgba: 78,158,253;
      --rlm-off-accent-rgba: 189,189,189;
      --rlm-input-rgba: 247,247,245;
      --rlm-border-rgba: 217,217,209;
      --rlm-window-rgba: 240,240,237;
      --rlm-window-bg-rgba: 240,240,237,0.9;
      --rlm-card-rgba: 252,252,251;
      --rlm-text-rgba: 10,10,8;
      --rlm-icon-rgba: 10,10,8,0.7;
      --rlm-mouse-rgba: 78,158,253;
      --rlm-brand-rgba: 240,135,53;
      --rlm-intent-alert-rgba: 255,98,64;
      --rlm-intent-caution-rgba: 240,135,53;
      --rlm-intent-success-rgba: 15,195,131;
      --rlm-overlay-hover-rgba: 0,0,0,0.04;
      --rlm-overlay-active-rgba: 0,0,0,0.06;
      --rlm-home-button-color: rgba(201,201,184,0.5);
      --rlm-dock-color: rgba(240,240,237,0.65);
      --rlm-base-color: #d9dad0;
      --rlm-accent-color: #4E9EFD;
      --rlm-off-accent-color: #BDBDBD;
      --rlm-input-color: #f7f7f5;
      --rlm-border-color: #d9d9d1;
      --rlm-window-color: #f0f0ed;
      --rlm-window-bg-color: rgba(240,240,237,0.9);
      --rlm-card-color: #fcfcfb;
      --rlm-text-color: #0a0a08;
      --rlm-icon-color: rgba(10,10,8,0.7);
      --rlm-mouse-color: #4E9EFD;
      --rlm-brand-color: #F08735;
      --rlm-intent-alert-color: #ff6240;
      --rlm-intent-caution-color: #F08735;
      --rlm-intent-success-color: #0fc383;
      --rlm-overlay-hover-color: rgba(0,0,0,0.04);
      --rlm-overlay-active-color: rgba(0,0,0,0.06);
  }

  .highlight-hover:hover {
    background-color: rgba(var(--rlm-overlay-hover-rgba));
    cursor: pointer;
  }
  .highlight-hover:focus {
    background-color: rgba(var(--rlm-overlay-hover-rgba));
    transition: '.25s ease';
    outline: none;
  }

  input[type="time"],
  input[type="date"] {
    font-family: var(--rlm-font);
    font-size: 12px;
    background-color: rgba(var(--rlm-input-rgba));
    color: rgba(var(--rlm-text-rgba));
    pointer-events: all;
    flex: 1;
    height: inherit;
    padding: 3px 6px;
    appearance: none;
    outline: none;
    border: 1px solid rgba(var(--rlm-border-rgba));
    border-radius: 6px;
    padding-inline-start: 9px;
  
  }
  input[type="time"]::-webkit-calendar-picker-indicator, input[type="date"]::-webkit-calendar-picker-indicator  {
    fill: rgba(var(--rlm-text-rgba), 0.5);
    font-size: 16px;//controls size of icon
    padding: 0;
  }
`;
declare global {
  interface Window {
    ship: string;
  }
}

export const App = () => {
  const [selectedSpace, setSelectedSpace] = useState<null | string>(null);
  const [spaceList, setSpaceList] = useState<string[]>([]);
  const [calendarList, setCalendarList] = useState<any>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<null | string>(null);
  const [spans, setSpans] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [datePickerSelected, setDatePickerSelected] = useState<any>(new Date());
  const fetchSpacesList = async () => {
    try {
      const result = await api.getSpaces();
      setSpaceList(result.spaces);
      log('fetchSpacesList result => ', result);
    } catch (e) {
      log('fetchSpacesList error => ', e);
    }
  };
  const fetchCalendarList = async () => {
    if (!selectedSpace) return;
    try {
      const result = isOur(selectedSpace)
        ? await api.getOurCalendar()
        : await api.getCalendarsSpace(selectedSpace);
      const cals = result.our ? result.our : result.calendars;
      if (cals) {
        const newCalendarList = Object.keys(cals).map((key: string) => {
          return { id: key, ...cals[key] };
        });
        setCalendarList(newCalendarList);
      } else {
        //reset if no results to clear list
        setCalendarList([]);
      }
      log('fetchCalendarList result =>', result);
    } catch (e) {
      log('fetchCalendarList error =>', e);
      //reset if no results to clear list
      setCalendarList([]);
    }
  };
  const fetchCalendarEntries = async (calendarId: string) => {
    setSpans([]); // always reset spans
    try {
      const result = await api.getCalendarData(calendarId);
      if (result.calendar) {
        const newSpans = Object.keys(result.calendar.spans).map(
          (key: string) => {
            return { id: key, ...result.calendar.spans[key] };
          }
        );
        const newFullDay = Object.keys(result.calendar.fulldays).map(
          (key: string) => {
            return { id: key, fullday: true, ...result.calendar.fulldays[key] };
          }
        );

        // For now Spans and Fullday events are different, marge them here
        setSpans([...newSpans, ...newFullDay]);
      }
      log('fetchCalendarEntries result => ', result);
    } catch (e) {
      log('fetchCalendarEntries error =>', e);
    }
  };
  const spansToEvents = (spans: any) => {
    log('spans', spans);
    const newEvents: any = [];
    spans.forEach((span: any) => {
      const metaData = span.metadata[span['def-data']];
      const reccurenceRule = span.rules[span['def-rule']]?.rid;
      for (const item of span.instances) {
        if (item.instance?.exception === 'skip') continue;
        let newEvent;
        if (span.fullday) {
          // NOTE: can use a unix milisecond for these start/end date params instead
          const startDate = new Date(item.instance?.instance);
          //params starting with _ are included in event's extendedProps (passed to <Event /> component)
          newEvent = {
            start: startDate, //js date object
            _startDate: startDate,
            _isFullday: true,
            allDay: true,
          };
        } else {
          // NOTE: can use a unix milisecond for these start/end date params instead
          const startDate = new Date(item.instance?.instance.start);
          const endDate = new Date(item.instance?.instance.end);
          // TODO: make a typescript type for events in the project
          //params starting with _ are included in event's extendedProps (passed to <Event /> component)
          newEvent = {
            start: startDate, //js date object
            end: endDate, //js date object
            _startDate: startDate,
            _endDate: endDate,
            _isFullday: false,
            allDay: false,
          };
        }
        newEvent = {
          ...newEvent,
          _spanId: span.id,
          _instanceId: item.idx,
          _calendarId: selectedCalendar,
          title: metaData.name,
          description: metaData.description,
          _color: metaData.color,
          _reccurenceRule: reccurenceRule,
        };
        newEvents.push(newEvent);
      }
    });

    setEvents(newEvents);
  };
  useEffect(() => {
    fetchSpacesList();
  }, []);
  useEffect(() => {
    if (selectedSpace) {
      fetchCalendarList();
    }
  }, [selectedSpace]);
  useEffect(() => {
    if (selectedCalendar) {
      fetchCalendarEntries(selectedCalendar);
    }
  }, [selectedCalendar]);
  useEffect(() => {
    spansToEvents(spans);
  }, [spans]);

  return (
    <main>
      {/* use this for design system menu to work, remove once we move to realm */}
      <div id="portal-root" />
      <GlobalStyle />
      <Flex>
        <Flex flexDirection={'column'} marginRight="8px">
          {selectedSpace && (
            <Button.TextButton
              tabIndex={1}
              onClick={() => setSelectedSpace(null)}
            >
              {selectedSpace}
            </Button.TextButton>
          )}
          {!selectedSpace ? (
            <SpaceList spaceList={spaceList} onSpaceSelect={setSelectedSpace} />
          ) : (
            <CalendarList
              space={selectedSpace}
              calendarList={calendarList}
              onCalendarSelect={setSelectedCalendar}
              selectedCalendar={selectedCalendar}
            />
          )}

          <Flex flexDirection={'column'} marginTop={'auto'}>
            {selectedCalendar && (
              <NewEvent
                selectedCalendar={selectedCalendar}
                datePickerSelected={datePickerSelected}
                setDatePickerValue={setDatePickerSelected}
              />
            )}
            <DatePicker
              onDatePickerSelect={setDatePickerSelected}
              datePickerSelected={datePickerSelected}
            />
          </Flex>
        </Flex>
        <Calendar events={events} datePickerSelected={datePickerSelected} />
      </Flex>
    </main>
  );
};
