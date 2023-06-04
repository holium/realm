import React from 'react';
import { Flex } from '@holium/design-system';
import { Word, Home } from './pages';
import { SearchBar, AddWord } from './components';

function App() {
  return (
    <>
      <div id="portal-root" />
      <Flex alignItems={'center'} flexDirection={'column'}>
        <SearchBar />
        <AddWord />
        <Word />
        <Home />
      </Flex>
    </>
  );
}

export default App;
