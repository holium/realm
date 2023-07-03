import React from 'react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import timeGridPlugin from '@fullcalendar/timegrid';
import { createGlobalStyle } from 'styled-components';

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

    --fc-small-font-size: .85em;
    --fc-button-text-color: orange;
  }
  
`;
// https://fullcalendar.io/docs/css-customization css customization
declare global {
  interface Window {
    ship: string;
  }
}

export const App = () => {
  const calendarRef: any = React.useRef(null);
  const events: any = [
    {
      id: '4213',
      title: 'event 10',
      description: 'I got stuff to do V1',
      participants: 'randy, chips, desu',
      date: '2023-07-03',
    },
    {
      id: '3412',
      title: 'event 2',
      description: 'I got stuff to do V2',
      participants: 'randy, chips, desu',
      date: '2023-07-03',
    },
  ];

  return (
    <>
      <GlobalStyle />
      <div style={{ width: '80%' }}>
        <FullCalendar
          ref={calendarRef}
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          plugins={[resourceTimelinePlugin, dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek" //dayGridMonth,  resourceTimelineWeek
          weekends={true}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth', // user can switch between the two
          }}
          height={'calc(90vh - 100px)'}
          /*  eventClick={(data: any) => {
          const eventData = data?.event["_def"];
          console.log("eventData => ", eventData);
          setSelectedEvent(eventData.publicId);
          calendarApiFoo();
        }}*/
          events={events}
          selectable
          select={(selectInfo: any) => {
            //for selecting a range
            console.log('selectInfo', selectInfo);
          }}
        />
      </div>
    </>
  );
};
