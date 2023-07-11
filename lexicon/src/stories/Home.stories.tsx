import { Flex } from '@holium/design-system';

import { Home, SearchBar } from '../components';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Lexicon/Word List',
  component: Home,
};

export const Default = () => (
  <Flex flexDirection="column" alignItems={'center'} marginBottom={10}>
    <Flex flexDirection="column" alignItems={'center'} width={600} height={700}>
      <SearchBar
        onAddWord={() => null}
        addModalOpen={true}
        backButton={false}
        onBack={() => null}
        navigate={null}
      />
      <Home
        navigate={null}
        addModalOpen={false}
        voteMap={voteMap}
        wordList={wordList}
        loadingMain={false}
      />
    </Flex>
  </Flex>
);
const wordList = [
  {
    id: '/~lux/~2023.6.29..15.11.59..0b9d',
    word: 'Based',
    createdAt: 1688051519045,
  },
  {
    id: '/~lux/~2023.6.29..15.14.20..9754',
    word: 'Cringe',
    createdAt: 1688051660591,
  },
];
const voteMap = new Map(
  Object.entries({
    '/~lux/~2023.6.29..15.14.20..9754': {
      votes: [
        {
          received_at: 1688051664348,
          parent_path: '/~lux/our',
          updated_at: 1688051664348,
          revision: null,
          id: '/~lux/~2023.6.29..15.14.24..5905',
          creator: '~lux',
          created_at: 1688051664348,
          up: 1,
          path: '/~lux/our',
          type: 'vote',
          parent_id: '/~lux/~2023.6.29..15.14.20..9754',
          parent_type: 'lexicon-word',
          v: 0,
        },
      ],
      upVotes: 1,
      downVotes: 0,
      currentShipVoted: {
        vote: true,
        voteId: '/~lux/~2023.6.29..15.14.24..5905',
      },
    },
    '/~lux/~2023.6.29..15.11.59..0b9d': {
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
    },
  })
);
