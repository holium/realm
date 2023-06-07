import React, { useState } from 'react';

import {
  Button,
  Card,
  Flex,
  Input,
  Text,
  TextInput,
} from '@holium/design-system';

import api from '../api';
import { log } from '../utils';

interface Props {
  open: boolean;
  onClose: Function;
}
export const AddWord = ({ open, onClose }: Props) => {
  const space: string = '/~lux/our';

  const [word, setWord] = useState<string>('');
  const [definition, setDefinition] = useState<string>('');
  const [sentence, setSentence] = useState<string>('');
  const [related, setRelated] = useState<string>('');

  const addWord = async () => {
    try {
      const result: any = await api.createWord(space, word);
      if (result) {
        //word created succesfully, create a definition and sentence if any
        const wordId = result['row-id'];

        const definitionResult = await api.createDefinition(
          space,
          wordId,
          definition
        );
        log('definitionResult', definitionResult);
        if (sentence) {
          const sentenceResult = await api.createSentence(
            space,
            wordId,
            sentence
          );
          log('sentenceResult', sentenceResult);
        }
      }
      resetForm();
      log('addWord result =>', result);
    } catch (e) {
      log('addword error => ', e);
    }
  };
  const resetForm = () => {
    setWord('');
    setDefinition('');
    setSentence('');
    setRelated('');
  };
  const handleSubmit = () => {
    addWord();
  };
  if (!open) return null;
  return (
    <Card
      p={3}
      elevation={4}
      minWidth={400}
      maxWidth={400}
      minHeight={400}
      marginBottom={12}
    >
      <Input
        style={{
          flex: 0,
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 16,
          padding: 0,
        }}
        id={'add-word-input'}
        tabIndex={1}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Add word"
        value={word}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
          setWord(evt.target.value);
        }}
      />
      <Flex flexDirection={'column'} gap={12}>
        <Flex flexDirection={'column'} gap={6}>
          <RequiredLabel text="Definition" />
          <TextInput
            id="definition-input"
            name="definition"
            value={definition}
            placeholder="Type your definition..."
            error={false}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setDefinition(evt.target.value);
            }}
          />
        </Flex>
        <Flex flexDirection={'column'} gap={6}>
          <Text.Label fontWeight={600}>Sentence</Text.Label>
          <TextInput
            id="add-word-sentence-input"
            name="sentence"
            value={sentence}
            placeholder="An example of how it’s used..."
            error={false}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setSentence(evt.target.value);
            }}
          />
        </Flex>
        <Flex flexDirection={'column'} gap={6}>
          <Text.Label fontWeight={600}>Related</Text.Label>
          <TextInput
            id="add-word-related-input"
            name="related"
            value={related}
            placeholder="words related to this one..."
            error={false}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setRelated(evt.target.value);
            }}
          />
        </Flex>
      </Flex>
      <Flex gap={10} justifyContent={'flex-end'} marginTop={'auto'}>
        <Button.Transparent
          fontSize={1}
          fontWeight={600}
          opacity={0.5}
          onClick={() => onClose()}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          fontSize={1}
          fontWeight={600}
          alignSelf={'flex-end'}
          onClick={handleSubmit}
          disabled={!definition || !word}
        >
          Submit
        </Button.TextButton>
      </Flex>
    </Card>
  );
};
const RequiredLabel = ({ text }: { text: string }) => {
  return (
    <Flex gap={2}>
      <Text.Label fontWeight={600}>{text}</Text.Label>
      <Text.Label
        fontWeight={600}
        style={{ color: 'rgba(var(--rlm-intent-alert-rgba))' }}
      >
        *
      </Text.Label>
    </Flex>
  );
};
