import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import useTroveStore, { TroveStore } from '../store/troveStore';

export const Navigation = () => {
  const { ship, group } = useParams();
  //presisted space data for filtering search correctly
  const setSpace = useTroveStore((store: TroveStore) => store.setSpace);

  useEffect(() => {
    //We care about knowing the space id, either through params {ship}/{group} or space id which is the same thing
    if (ship && group) {
      //isAdminScry(space);
      const space = `${ship}/${group}`;
      setSpace(space);
    }
  }, [ship, group]);

  return (
    <>
      <Outlet />
    </>
  );
};
