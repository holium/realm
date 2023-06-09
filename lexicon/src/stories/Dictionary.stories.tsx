import { Flex } from '@holium/design-system';

import { SearchBar } from '../components';
import { Dictionary } from '../pages';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Lexicon/Dictionary Definition',
  component: Dictionary,
};

export const Default = () => (
  <Flex flexDirection="column" alignItems={'center'}>
    <SearchBar
      onAddWord={() => null}
      addModalOpen={false}
      backButton={true}
      onBack={() => null}
    />
    <Dictionary />
  </Flex>
);
