import { useRef } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import timeGridPlugin from '@fullcalendar/timegrid';
import { createGlobalStyle } from 'styled-components';

import { Box } from '@holium/design-system';
const CalendarStyle = createGlobalStyle`


  :root {
    --fc-small-font-size: .85em;
    --fc-button-text-color: orange;


  }


`;
// https://fullcalendar.io/docs/css-customization css customization

export const Calendar = () => {
  const calendarRef: any = useRef(null);
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
    <Box width={'100%'}>
      <CalendarStyle />

      <FullCalendar
        ref={calendarRef}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        plugins={[resourceTimelinePlugin, dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek" //dayGridMonth,  resourceTimelineWeek
        weekends={true}
        headerToolbar={{
          left: 'prev,today,next',
          center: 'title',
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
    </Box>
  );
};
