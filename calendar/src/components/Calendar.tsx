import { useRef } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import timeGridPlugin from '@fullcalendar/timegrid';
import { createGlobalStyle } from 'styled-components';

import { Card } from '@holium/design-system';
const CalendarStyle = createGlobalStyle`


  :root {
    --fc-small-font-size: .85em;

    --fc-page-bg-color: #fff;
    --fc-neutral-bg-color: rgba(208, 208, 208, 0.3);
    --fc-neutral-text-color: #808080;
    --fc-border-color: rgba(var(--rlm-border-rgba));
  
    --fc-button-text-color: rgba(var(--rlm-text-rgba), 1);
    --fc-button-bg-color: transparent;
  
    --fc-event-bg-color: rgba(var(--rlm-accent-rgba));
    --fc-event-border-color: rgba(var(--rlm-accent-rgba));
    --fc-event-text-color: #fff;
    --fc-event-selected-overlay-color: rgba(0, 0, 0, 0.25);
  
    --fc-more-link-bg-color: #d0d0d0;
    --fc-more-link-text-color: inherit;
  
    --fc-event-resizer-thickness: 8px;
    --fc-event-resizer-dot-total-width: 8px;
    --fc-event-resizer-dot-border-width: 1px;
  
    --fc-non-business-color: rgba(215, 215, 215, 0.3);
    --fc-bg-event-color: rgb(143, 223, 130);
    --fc-bg-event-opacity: 0.3;
    --fc-highlight-color: rgba(188, 232, 241, 0.3);
    --fc-today-bg-color: rgba(var(--rlm-accent-rgba),.15);
    --fc-now-indicator-color: red;
  }

  .fc .fc-button-primary {
  
    font-size: 14px;
    font-weight: 500;
    border-radius: 5px;
    z-index: 13;
    inset: 0px;
    border: none;
    user-select: none;
    text-transform: capitalize;
  }
  .fc .fc-button-primary:not(:disabled).fc-button-active, .fc .fc-button-primary:not(:disabled):active {
    background-color: rgba(var(--rlm-accent-rgba),0.12);
    color: rgba(var(--rlm-accent-rgba));

  }
  .fc .fc-button-primary:hover {
    background-color: transparent;
  }
  .fc .fc-button-primary:focus {
    box-shadow: none;
  }
  .fc .fc-button-primary:not(:disabled).fc-button-active:focus, .fc .fc-button-primary:not(:disabled):active:focus {
    box-shadow: none;
  }
  .fc-direction-ltr {

    & .fc-button-group > .fc-button:not(:first-child) {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
  
    & .fc-button-group > .fc-button:not(:last-child) {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  
  }
  .fc-daygrid-day-frame fc-scrollgrid-sync-inner {
    background: yellow;
  }
  .fc .fc-button .fc-icon {
    font-size: 1.25em;
    color: rgba(var(--rlm-icon-rgba));
    

  }
  .fc-next-button:active {
    background-color: transparent!important;
    color: rgba(var(--rlm-icon-rgba))!important;
  }
  .fc-prev-button:active {
    background-color: transparent!important;
    color: rgba(var(--rlm-icon-rgba))!important;
  }
  .fc-theme-standard .fc-scrollgrid {
    border: hidden;
    border-right: hidden;
  }
  .fc .fc-scrollgrid-section > * {
    border: hidden;
  }
  .fc .fc-toolbar.fc-header-toolbar {
    margin-right: 8px;
    margin-top: 8px;
  }
 .fc-col-header-cell{
    border-left: hidden!important;
    border-right: hidden;
  }
  button.fc-today-button {
    color: rgba(var(--rlm-text-rgba), 1)!important;
    text-transform: capitalize!important;
    background-color: rgba(0,0,0,.05)!important;
  }

`;
// https://fullcalendar.io/docs/css-customization css customization
interface Props {
  events: any;
}
export const Calendar = ({ events }: Props) => {
  const calendarRef: any = useRef(null);

  return (
    <Card width={'100%'}>
      <CalendarStyle />

      <FullCalendar
        //timeZone="UTC"
        ref={calendarRef}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        plugins={[resourceTimelinePlugin, dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth" //dayGridMonth,  resourceTimelineWeek,timeGridWeek
        weekends={true}
        headerToolbar={{
          left: 'prev,today,next',
          // center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth', // user can switch between the two
        }}
        height={'calc(100vh - 30px )'}
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
    </Card>
  );
};
