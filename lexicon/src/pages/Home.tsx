import { useNavigate } from 'react-router-dom';

import { Card, Flex, Text } from '@holium/design-system';

import { WordItem } from '../components';
import { Store, useStore } from '../store';

export const Home = () => {
  const navigate = useNavigate();

  //  const currentPage = store((state) => state.currentPage); move to this to only rerender on specifc element chnage
  const voteMap = useStore((state: Store) => state.voteMap);
  const wordList = useStore((state: Store) => state.wordList);

  return (
    <Card p={'10px'} elevation={4} maxWidth={400} minWidth={400}>
      <Flex flexDirection={'column'}>
        {wordList.map((item: any, index: number) => {
          const { id, word, createdAt } = item;
          const votes = voteMap.get(id);
          return (
            <WordItem
              key={'word-item-' + index}
              id={id}
              word={word}
              createdAt={createdAt}
              votes={votes}
              navigate={navigate}
            />
          );
        })}
      </Flex>
    </Card>
  );
};
interface WordItemProps {
  id: string;
  word: string;
  createdAt: number;
  votes: any;
  navigate: any;
}
const WordItem = ({ id, word, createdAt, votes, navigate }: WordItemProps) => {
  const { space } = useStore();

  return (
    <Flex
      flexDirection={'column'}
      gap={8}
      padding={'10px'}
      style={{ borderRadius: 6 }}
      className="highlight-hover"
      tabIndex={0}
      onClick={() =>
        navigate('/apps/lexicon' + space + '/' + word, {
          state: { id, word, createdAt, votes },
        })
      }
    >
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Text.H6 fontWeight={600}>{word}</Text.H6>
        <Text.Body opacity={0.5}> ~lodlev-migdev</Text.Body>
      </Flex>
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Vote id={id} votes={votes} />
        <Text.Body opacity={0.5} style={{ marginBottom: 3 }}>
          {displayDate(createdAt)}
        </Text.Body>
      </Flex>
    </Flex>
  );
};
