import { Card, Flex, Spinner, Text } from '@holium/design-system';

import { WordItem } from '../components';
import { LexiconWord } from '../store';

type Props = {
  navigate: any;
  addModalOpen: boolean;
  voteMap: any;
  wordList: LexiconWord[];
  loadingMain: boolean;
};

export const Home = ({
  navigate,
  addModalOpen,
  voteMap,
  wordList,
  loadingMain,
}: Props) => {
  return (
    <Card
      p={'10px'}
      elevation={4}
      width="100%"
      style={{ display: addModalOpen ? 'none' : 'flex' }}
    >
      <Flex flexDirection={'column'}>
        {loadingMain && <Spinner size={1} />}
        {!loadingMain && wordList.length === 0 && (
          <Text.H6 opacity=".7" fontWeight={500} textAlign="center">
            No words in this space, add one to start
          </Text.H6>
        )}
        {wordList
          // Filter duplicate ids
          .filter(
            (word, i, self) => i === self.findIndex((w) => w.id === word.id)
          )
          .map((word, index: number) => {
            const votes = voteMap.get(word.id);
            return (
              <WordItem
                key={`${word.word}-${index}-${word.id}`}
                id={word.id}
                word={word.word}
                createdAt={word.createdAt}
                votes={votes}
                navigate={navigate}
              />
            );
          })}
      </Flex>
    </Card>
  );
};
