import React, { useEffect, useState } from 'react';
import {
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { Flex } from '@holium/design-system';

import { SearchBar } from './components';

export const Navigation = () => {
  const [searchParams] = useSearchParams();
  const { ship, group, word } = useParams();
  //presisted space data for filtering search correctly
  const [space, setSpace] = useState<string>('');
  const navigate = useNavigate();
  //  const { setModalOpen, modalOpen, isAdminScry, isAdmin } = useLexiconStore();
  useEffect(() => {
    const spaceId = searchParams.get('spaceId');
    if (spaceId) {
      navigate('/apps/lexicon' + spaceId);
    }
  }, [searchParams.get('spaceId')]);
  useEffect(() => {
    //We care about knowing the space id, either through params {ship}/{group} or space id which is the same thing
    if (ship && group) {
      const space = `${ship}/${group}`;
      setSpace(space);
      //isAdminScry(space);
    }
    //everytime we get a new space (ship/group) we check if we are admins on that space, via a scry
  }, [ship, group]);
  //render the relevant route
  return (
    <Flex flexDirection={'column'} alignItems={'center'}>
      <SearchBar />
      <Outlet />
    </Flex>
  );
};
