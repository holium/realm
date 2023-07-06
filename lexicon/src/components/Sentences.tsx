import React, { useState } from 'react';

import { Button, Flex, TextInput } from '@holium/design-system';

import { SentenceRow } from '../api/types/bedrock';
import { Store, useStore } from '../store';
import { log } from '../utils';
import { WordDefinitionElement } from './WordDefinitionElement';

export const Sentences = ({ sentenceList, space, state }: any) => {
  const api = useStore((store: Store) => store.api);

  const [newSentence, setNewSentence] = useState<string>('');
  const sentenceVoteMap = useStore((state: Store) => state.sentenceVoteMap);

  const handleSubmitNewSentence = async () => {
    if (!space) return;
    try {
      const wordId = state.id;

      const definitionResult = await api.createSentence(
        space,
        wordId,
        newSentence
      );

      log('handleSubmitNewSentence result =>', definitionResult);
      setNewSentence('');
    } catch (e) {
      log('handleSubmitNewSentence error => ', e);
    }
  };
  return (
    <>
      <Flex flexDirection="column" gap={20}>
        {sentenceList.map((item: SentenceRow, index: number) => {
          const votes = sentenceVoteMap.get(item.id);

          return (
            <WordDefinitionElement
              id={item.id}
              text={item.sentence}
              votes={votes}
              key={'sentence-item-' + index}
            />
          );
        })}
      </Flex>

      <Flex flexDirection={'column'} gap={10} marginTop={'auto'}>
        <TextInput
          id="definition-input"
          name="definition"
          style={{
            marginTop: 30,
            borderRadius: 6,
            paddingLeft: 9,
          }}
          value={newSentence}
          placeholder="Add a new sentence..."
          error={false}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewSentence(evt.target.value);
          }}
        />
        <Button.TextButton
          fontSize={1}
          fontWeight={500}
          alignSelf={'flex-end'}
          onClick={handleSubmitNewSentence}
        >
          Submit
        </Button.TextButton>
      </Flex>
    </>
  );
};
