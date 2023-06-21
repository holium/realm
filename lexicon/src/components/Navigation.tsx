import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { Flex } from '@holium/design-system/general';

import { Store, useStore } from '../store';
import { AddWord, SearchBar } from '.';

interface Props {
  selectedSpace: string;
}
export const Navigation = ({ selectedSpace }: Props) => {
  const { ship, group, word } = useParams();
  //presisted space data for filtering search correctly
  const navigate = useNavigate();
  const setAddModalOpen = useStore((state: Store) => state.setAddModalOpen);
  const addModalOpen = useStore((state: Store) => state.addModalOpen);
  const setSpace = useStore((state: Store) => state.setSpace);

  useEffect(() => {
    if (selectedSpace) {
      navigate('/index.html' + selectedSpace);
    }
  }, [selectedSpace]);

  useEffect(() => {
    //We care about knowing the space id, either through params {ship}/{group} or space id which is the same thing
    if (ship && group) {
      const space = `/${ship}/${group}`;
      setSpace(space);
      //isAdminScry(space);
    }
    //everytime we get a new space (ship/group) we check if we are admins on that space, via a scry
  }, [ship, group]);
  //render the relevant route
  return (
    <Flex
      style={{
        minHeight: 'calc(100% - 20px)',
      }}
      flexDirection={'column'}
      alignItems={'center'}
      marginRight={'20px'}
      marginLeft={'20px'}
      marginBottom={'20px'}
    >
      <SearchBar
        addModalOpen={addModalOpen}
        onAddWord={() => setAddModalOpen(true)}
        backButton={!!word}
        onBack={() => navigate(-1)}
      />
      <AddWord open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <Outlet />
    </Flex>
  );
};
