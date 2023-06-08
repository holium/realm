import { Flex } from '@holium/design-system';

import { SearchBar } from '../components';
import { Home } from '../pages';

export default {
  title: 'Lexicon/Word List',
  component: Home,
};

export const Default = () => (
  <Flex flexDirection="column" alignItems={'center'}>
    <SearchBar
      onAddWord={() => null}
      addModalOpen={true}
      backButton={false}
      onBack={() => null}
    />
    <Home />
  </Flex>
);
