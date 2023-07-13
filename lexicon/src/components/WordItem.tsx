import { useEffect, useState } from 'react';

import { Flex, Text } from '@holium/design-system/general';

import { Store, useStore } from '../store';
import { displayDate } from '../utils';
import { Vote } from './Vote';

type Props = {
  id: string;
  word: string;
  createdAt: number;
  votes: any;
  navigate: any;
};

export const WordItem = ({ id, word, createdAt, votes, navigate }: Props) => {
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
    navigate(space + '/' + word, {
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
