import { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

import {
  Box,
  Button,
  Flex,
  Icon,
  SectionDivider,
  Text,
} from '@holium/design-system';

import { api } from './api';
import { Calendar, DatePicker } from './components';
import { log } from './utils';

import 'react-day-picker/dist/style.css';

const GlobalStyle = createGlobalStyle`
  html { 
    overflow: hidden;
    font-family: var(--rlm-font);
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
    --theme-mode: light;
    --rlm-font: 'Rubik', sans-serif;
    --blur: blur(24px);
    --transition-fast: all 0.25s ease;
    --transition: 0.4s ease;
    --transition-2x: all 0.5s ease;
    --rlm-border-radius-4: 4px;
    --rlm-border-radius-6: 6px;
    --rlm-border-radius-9: 9px;
    --rlm-border-radius-12: 12px;
    --rlm-border-radius-16: 16px;
    --rlm-box-shadow-1: 0px 0px 4px rgba(0, 0, 0, 0.06);
    --rlm-box-shadow-2: 0px 0px 9px rgba(0, 0, 0, 0.12);
    --rlm-box-shadow-3: 0px 0px 9px rgba(0, 0, 0, 0.18);
    --rlm-box-shadow-lifted: 0px 0px 9px rgba(0, 0, 0, 0.24);
    --rlm-home-button-rgba: 204, 204, 204, 0.5;
    --rlm-dock-rgba: 255, 255, 255, 0.65;
    --rlm-base-rgba: 240, 183, 185;
    --rlm-accent-rgba: 78, 158, 253;
    --rlm-off-accent-rgba: 189, 189, 189;
    --rlm-input-rgba: 255, 255, 255;
    --rlm-border-rgba: 230, 230, 230;
    --rlm-window-rgba: 255, 255, 255;
    --rlm-window-bg-rgba: 255, 255, 255, 0.9;
    --rlm-card-rgba: 255, 255, 255;
    --rlm-text-rgba: 12, 3, 3;
    --rlm-icon-rgba: 12, 3, 3, 0.7;
    --rlm-mouse-rgba: 78, 158, 253;
    --rlm-brand-rgba: 240, 135, 53;
    --rlm-intent-alert-rgba: 255, 98, 64;
    --rlm-intent-caution-rgba: 240, 135, 53;
    --rlm-intent-success-rgba: 15, 195, 131;
    --rlm-overlay-hover-rgba: 0, 0, 0, 0.04;
    --rlm-overlay-active-rgba: 0, 0, 0, 0.06;
    --rlm-home-button-color: rgba(204, 204, 204, 0.5);
    --rlm-dock-color: rgba(255, 255, 255, 0.65);
    --rlm-base-color: #f0b7b9;
    --rlm-accent-color: #4e9efd;
    --rlm-off-accent-color: #bdbdbd;
    --rlm-input-color: #fff;
    --rlm-border-color: #e6e6e6;
    --rlm-window-color: #fff;
    --rlm-window-bg-color: rgba(255, 255, 255, 0.9);
    --rlm-card-color: #fff;
    --rlm-text-color: #0c0303;
    --rlm-icon-color: rgba(12, 3, 3, 0.7);
    --rlm-mouse-color: #4e9efd;
    --rlm-brand-color: #f08735;
    --rlm-intent-alert-color: #ff6240;
    --rlm-intent-caution-color: #f08735;
    --rlm-intent-success-color: #0fc383;
    --rlm-overlay-hover-color: rgba(0, 0, 0, 0.04);
    --rlm-overlay-active-color: rgba(0, 0, 0, 0.06);
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
    log('spans', spans[1]);
    // TODO: makes this accumlate all of the spans instances...
    const metaData = spans[1].metadata[spans[1]['def-data']];
    const newEvents = Object.entries(spans[1]?.instances).map((item: any) => {
      const startDate = new Date(item[1].instance?.instance.start);
      const endDate = new Date(item[1].instance?.instance.end);
      // TODO: make a typescript type for events in the project
      return {
        id: '/' + item[0] + item[1].mid,
        start: startDate, //js date object
        end: endDate, //js date object
        title: metaData.name,
        description: metaData.description,
      };
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
    if (spans.length > 0) {
      spansToEvents(spans);
    }
  }, [spans]);
  return (
    <main style={{ backgroundColor: 'var(--rlm-window-rgba)' }}>
      <GlobalStyle />
      <Flex>
        <Flex flexDirection={'column'}>
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
                        : 'auto',
                    borderRadius: '12px',
                    padding: '4px 8px',
                  }}
                  onClick={() => {
                    setSelectedCalendar(item.id);
                  }}
                >
                  <Text.Body fontWeight={600}> {item.title}</Text.Body>
                </Box>
              );
            })}
          </Flex>
          <Flex flexDirection={'column'} marginTop={'auto'}>
            <Button.TextButton width="100%" justifyContent={'center'}>
              <Icon name="Plus" size={24} opacity={0.5} />
              New event
            </Button.TextButton>
            <DatePicker />
          </Flex>
        </Flex>
        <Calendar events={events} />
      </Flex>
    </main>
  );
};
