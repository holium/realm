import { Flex } from '@holium/design-system';

import { SearchBar } from '../components';
import { Word } from '../pages';

export default {
  title: 'Lexicon/Word Details',
  component: Word,
};

export const Default = () => (
  <Flex flexDirection="column" alignItems={'center'} marginBottom={10}>
    <Flex flexDirection="column" alignItems={'center'} width={600} height={700}>
      <SearchBar
        onAddWord={() => null}
        addModalOpen={false}
        backButton={true}
        onBack={() => null}
        navigate={null}
      />
      <Word
        space={''}
        state={{ word: 'Based', id: '/~lux/~2023.6.29..15.11.59..0b9d' }}
        definitionList={definitionList}
        sentenceList={sentenceList}
        votes={votes}
        removeWord={null}
        goToDict={null}
      />
    </Flex>
  </Flex>
);
const definitionList = [
  {
    received_at: 1688051519248,
    definition: 'the opposite of cringe',
    updated_at: 1688051519248,
    revision: null,
    id: '/~lux/~2023.6.29..15.11.59..3f8a',
    created_at: 1688051519248,
    path: '/~lux/our',
    type: 'lexicon-definition',
    word_id: '/~lux/~2023.6.29..15.11.59..0b9d',
    v: 0,
  },
];
const sentenceList = [
  {
    received_at: 1688051519285,
    sentence: 'this guy is not based!',
    updated_at: 1688051519285,
    revision: null,
    id: '/~lux/~2023.6.29..15.11.59..48e1',
    created_at: 1688051519285,
    path: '/~lux/our',
    type: 'lexicon-sentence',
    word_id: '/~lux/~2023.6.29..15.11.59..0b9d',
    v: 0,
  },
];
const votes = {
  votes: [
    {
      received_at: 1688051526550,
      parent_path: '/~lux/our',
      updated_at: 1688051526550,
      revision: null,
      id: '/~lux/~2023.6.29..15.12.06..8cba',
      creator: '~lux',
      created_at: 1688051526550,
      up: 1,
      path: '/~lux/our',
      type: 'vote',
      parent_id: '/~lux/~2023.6.29..15.11.59..0b9d',
      parent_type: 'lexicon-word',
      v: 0,
    },
  ],
  upVotes: 1,
  downVotes: 0,
  currentShipVoted: {
    vote: true,
    voteId: '/~lux/~2023.6.29..15.12.06..8cba',
  },
};
