import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, Flex, Spinner, Text } from '@holium/design-system';

import { Vote } from '../components';
import { Store, useStore } from '../store';
import { displayDate } from '../utils';

export const Home = () => {
  const navigate = useNavigate();

  const addModalOpen = useStore((state: Store) => state.addModalOpen);
  const voteMap = useStore((state: Store) => state.voteMap);
  const wordList = useStore((state: Store) => state.wordList);
  const loadingMain = useStore((state: Store) => state.loadingMain);

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
interface WordItemProps {
  id: string;
  word: string;
  createdAt: number;
  votes: any;
  navigate: any;
}
const WordItem = ({ id, word, createdAt, votes, navigate }: WordItemProps) => {
  const space = useStore((store: Store) => store.space);
  const definitionMap = useStore((store: Store) => store.definitionMap);
  const definitionVoteMap = useStore((store: Store) => store.definitionVoteMap);

  const [mostVotedDefinition, setMostVotedDefinition] = useState<string>('');
  useEffect(() => {
    //get the most upvoted definition
    const relatedDefinitions = definitionMap.get(id);
    if (relatedDefinitions?.length > 0) {
      let newMostVotedDefinition = relatedDefinitions[0].definition; //initilise as the first definition
      let mostVotedCount = 0; //intilise as the initial most voted count, this gets reset for the first element any
      relatedDefinitions?.forEach((item: any) => {
        const upVoteCount = definitionVoteMap.get(item.id)?.upVotes ?? 0;
        if (upVoteCount > mostVotedCount) {
          //we have a new top voted definition
          mostVotedCount = upVoteCount;
          newMostVotedDefinition = item.definition;
        }
      });
      setMostVotedDefinition(newMostVotedDefinition);
    }
  }, [definitionMap, definitionVoteMap]);
  const navigateToWord = () => {
    navigate('/index.html' + space + '/' + word, {
      state: { id, word, createdAt, votes },
    });
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      navigateToWord();
    }
  };
  return (
    <Flex
      flexDirection={'column'}
      gap={8}
      padding={'10px'}
      style={{ borderRadius: 6 }}
      className="highlight-hover"
      tabIndex={0}
      onClick={navigateToWord}
      onKeyDown={handleKeyDown}
    >
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Text.H6 fontWeight={600}>{word}</Text.H6>
        <Text.Body opacity={0.5} fontWeight={500}>
          {id?.split('/')[1]}
        </Text.Body>
      </Flex>
      <Text.Body opacity={0.7} fontWeight={500}>
        {mostVotedDefinition}
      </Text.Body>
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Vote id={id} votes={votes} />
        <Text.Body opacity={0.5} fontWeight={500} style={{ marginBottom: 3 }}>
          {displayDate(createdAt)}
        </Text.Body>
      </Flex>
    </Flex>
  );
};
