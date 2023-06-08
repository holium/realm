import { Flex } from '@holium/design-system';

import { SearchBar } from '../components';
import { Dictionary } from '../pages';

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