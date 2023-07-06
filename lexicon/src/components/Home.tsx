import { Card, Flex, Spinner, Text } from '@holium/design-system';

import { WordItem } from '../components';
interface Props {
  navigate: any;
  addModalOpen: boolean;
  voteMap: any;
  wordList: any;
  loadingMain: boolean;
}
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
