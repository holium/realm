import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import useCalendarStore, { CalendarStore } from '../CalendarStore';
import { log } from '../utils';
export const Navigation = () => {
  // const [searchParams] = useSearchParams();
  const publicCalendarId = useCalendarStore(
    (store: CalendarStore) => store.publicCalendarId
  );
  const setPublicCalendarId = useCalendarStore(
    (store: CalendarStore) => store.setPublicCalendarId
  );
  const { ship, calendar } = useParams();
  //presisted space data for filtering search correctly
  log('publicCalendarId', publicCalendarId);
  useEffect(() => {
    if (!ship || !calendar) {
      setPublicCalendarId(null);
    } else {
      const newPublicCalendarId = `${ship}/${calendar}`;
      setPublicCalendarId(newPublicCalendarId);
    }
  }, [ship, calendar]);
  return (
    <>
      <Outlet />
    </>
  );
};
