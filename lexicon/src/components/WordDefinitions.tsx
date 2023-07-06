import React, { useState } from 'react';

import { Button, Flex, TextInput } from '@holium/design-system';

import { DefinitionRow } from '../api/types/bedrock';
import { Store, useStore } from '../store';
import { log } from '../utils';
import { WordDefinitionElement } from './WordDefinitionElement';

export const WordDefinitions = ({ definitionList, state, space }: any) => {
  const api = useStore((store: Store) => store.api);

  const [newDefinition, setNewDefinition] = useState<string>('');
  const definitionVoteMap = useStore((state: Store) => state.definitionVoteMap);

  const handleSubmitNewDefinition = async () => {
    if (!space) return;
    try {
      const wordId = state.id;

      const definitionResult = await api.createDefinition(
        space,
        wordId,
        newDefinition
      );

      log('handleSubmitNewDefinition result =>', definitionResult);
      setNewDefinition('');
    } catch (e) {
      log('handleSubmitNewDefinition error => ', e);
    }
  };
  return (
    <>
      <Flex flexDirection="column" gap={20}>
        {definitionList.map((item: DefinitionRow, index: number) => {
          const votes = definitionVoteMap.get(item.id);
          return (
            <WordDefinitionElement
              id={item.id}
              text={item.definition}
              key={'definition-item-' + index}
              votes={votes}
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
          value={newDefinition}
          placeholder="Add a new definition..."
          error={false}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewDefinition(evt.target.value);
          }}
        />
        <Button.TextButton
          fontSize={1}
          fontWeight={500}
          alignSelf={'flex-end'}
          onClick={handleSubmitNewDefinition}
        >
          Submit
        </Button.TextButton>
      </Flex>
    </>
  );
};
