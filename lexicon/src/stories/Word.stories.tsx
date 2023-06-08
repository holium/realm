import { Flex } from '@holium/design-system';

import { SearchBar } from '../components';
import { Word } from '../pages';

export default {
  title: 'Lexicon/Word Details',
  component: Word,
};

export const Default = () => (
  <Flex flexDirection="column" alignItems={'center'}>
    <SearchBar
      onAddWord={() => null}
      addModalOpen={false}
      backButton={true}
      onBack={() => null}
    />
    <Word />
  </Flex>
);
