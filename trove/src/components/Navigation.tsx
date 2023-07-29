import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import useTroveStore, { TroveStore } from '../store/troveStore';

interface Props {
  selectedSpace: string;
}
export const Navigation = ({ selectedSpace }: Props) => {
  const { ship, group } = useParams();
  //presisted space data for filtering search correctly
  const navigate = useNavigate();
  const setSpace = useTroveStore((store: TroveStore) => store.setSpace);
  useEffect(() => {
    //everytime space changes redirect to that space
    if (selectedSpace) {
      navigate(selectedSpace);
    }
  }, [selectedSpace]);
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
