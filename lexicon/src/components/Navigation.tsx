import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { Flex } from '@holium/design-system/general';

import { Store, useStore } from '../store';
import { AddWord, SearchBar } from '.';

interface Props {
  selectedSpace: string;
}
export const Navigation = ({ selectedSpace }: Props) => {
  const { ship, group, word: wordView } = useParams();
  //presisted space data for filtering search correctly
  const navigate = useNavigate();
  const setAddModalOpen = useStore((state: Store) => state.setAddModalOpen);
  const addModalOpen = useStore((state: Store) => state.addModalOpen);
  const setSpace = useStore((state: Store) => state.setSpace);

  const [word, setWord] = useState('');

  useEffect(() => {
    //everytime space changes redirect to that space
    if (selectedSpace) {
      navigate(selectedSpace);
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

  return (
    <Flex
      style={{
        minHeight: 'calc(100% - 20px)',
      }}
      flexDirection="column"
      alignItems="center"
      marginRight="20px"
      marginLeft="20px"
      marginBottom="20px"
    >
      <SearchBar
        addModalOpen={addModalOpen}
        onAddWord={(searchQuery) => {
          if (searchQuery) setWord(searchQuery);
          else setWord('');
          setAddModalOpen(true);
        }}
        backButton={!!wordView}
        onBack={() => navigate(-1)}
        navigate={navigate}
      />
      <AddWord
        open={addModalOpen}
        word={word}
        setWord={setWord}
        onClose={() => setAddModalOpen(false)}
      />
      <Outlet />
    </Flex>
  );
};
