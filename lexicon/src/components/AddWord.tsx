import React, { useState } from 'react';

import {
  Button,
  Card,
  ErrorBox,
  Flex,
  Text,
} from '@holium/design-system/general';
import { Input, TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { Store, useStore } from '../store';
import { log } from '../utils';

type Props = {
  open: boolean;
  word: string;
  setWord: (word: string) => void;
  onClose: () => void;
};

export const AddWord = ({ open, word, setWord, onClose }: Props) => {
  const api = useStore((store: Store) => store.api);
  const space = useStore((store: Store) => store.space);
  const [definition, setDefinition] = useState<string>('');
  const [sentence, setSentence] = useState<string>('');
  const [error, setError] = useState<string>(''); // TODO: error never displays since thread doesn't error
  const adding = useToggle();

  if (!space) return null;
  if (!open) return null;

  const addWord = async () => {
    setError('');
    adding.toggleOn();

    try {
      const result: any = await api.createWord(space, word);
      log('result', result);
      //word created succesfully, create a definition and sentence if any
      const wordId = result['id'];

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

      resetForm();
      onClose();
      log('addWord result =>', result);
    } catch (e) {
      log('addword error => ', e);
      setError('Something went wrong');
    }

    adding.toggleOff();
  };

  const resetForm = () => {
    setWord('');
    setDefinition('');
    setSentence('');
  };

  const handleSubmit = () => {
    addWord();
  };

  return (
    <Card flex={1} p={3} elevation={4} width={'100%'} minHeight={400}>
      <Input
        style={{
          flex: 0,
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 16,
          padding: 0,
          backgroundColor: 'transparent',
        }}
        id="add-word-input"
        autoFocus
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
      <Flex flexDirection={'column'} gap={16}>
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
      </Flex>

      {error && (
        <Flex
          marginTop={'auto'}
          flexDirection={'column'}
          style={{ textAlign: 'center' }}
        >
          <ErrorBox>{error}</ErrorBox>
        </Flex>
      )}
      <Flex
        gap={10}
        justifyContent={'flex-end'}
        marginTop={error ? '20px' : 'auto'}
      >
        <Button.Transparent
          fontSize={1}
          fontWeight={500}
          opacity={0.7}
          disabled={adding.isOn}
          onClick={onClose}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          fontSize={1}
          fontWeight={500}
          alignSelf={'flex-end'}
          disabled={!definition || !word || adding.isOn}
          onClick={handleSubmit}
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
