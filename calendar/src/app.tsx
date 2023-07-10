import { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

import { Flex } from '@holium/design-system';

import { api } from './api';
import { Calendar, CalendarList, DatePicker, NewEvent } from './components';
import { log } from './utils';

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
      --rlm-icon-rgba: 10,10,8,0.;
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
  
`;
declare global {
  interface Window {
    ship: string;
  }
}

export const App = () => {
  const [calendarList, setCalendarList] = useState<any>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<null | string>(null);
  const [spans, setSpans] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [datePickerSelected, setDatePickerSelected] = useState<any>(new Date());

  const fetchCalendarList = async () => {
    try {
      const result = await api.getCalendarList();
      log('fetchCalendarList result => ', result);
      if (result.calendars) {
        const newCalendarList = Object.keys(result.calendars).map(
          (key: string) => {
            return { id: key, ...result.calendars[key] };
          }
        );
        setCalendarList(newCalendarList);
      }
    } catch (e) {
      log('fetchCalendarList error =>', e);
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
        setSpans(newSpans);
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
      span.instances.forEach((item: any) => {
        const startDate = new Date(item.instance?.instance.start);
        const endDate = new Date(item.instance?.instance.end);
        // TODO: make a typescript type for events in the project
        newEvents.push({
          id: '/' + item.idx + item.mid,
          start: startDate, //js date object
          end: endDate, //js date object
          title: metaData.name,
          description: metaData.description,
        });
      });
    });

    setEvents(newEvents);

    log('newEvents', newEvents);
  };
  useEffect(() => {
    fetchCalendarList();
  }, []);
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
      <GlobalStyle />

      <Flex>
        <Flex flexDirection={'column'} marginRight="8px">
          <CalendarList
            calendarList={calendarList}
            onCalendarSelect={setSelectedCalendar}
            selectedCalendar={selectedCalendar}
          />
          <Flex flexDirection={'column'} marginTop={'auto'}>
            {selectedCalendar && (
              <NewEvent
                selectedCalendar={selectedCalendar}
                datePickerSelected={datePickerSelected}
              />
            )}
            <DatePicker
              onDatePickerSelect={setDatePickerSelected}
              datePickerSelected={datePickerSelected}
            />
          </Flex>
        </Flex>
        <Calendar events={events} />
      </Flex>
    </main>
  );
};
