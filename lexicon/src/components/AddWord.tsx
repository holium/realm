import React, { useState } from 'react';
import {
  Button,
  Icon,
  Card,
  Flex,
  Text,
  TextInput,
  Input,
} from '@holium/design-system';
export default function AddWord() {
  const [word, setWord] = useState<string>('');
  return (
    <Card p={3} elevation={4} minWidth={400} maxWidth={400} minHeight={400} marginBottom={12}>
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
            value={''}
            placeholder="Type your definition..."
            error={false}
            onChange={() => null}
          />
        </Flex>
        <Flex flexDirection={'column'} gap={6}>
          <Text.Label fontWeight={600}>Sentence</Text.Label>
          <TextInput
            id="add-word-sentence-input"
            name="sentence"
            value={''}
            placeholder="An example of how it’s used..."
            error={false}
            onChange={() => null}
          />
        </Flex>
        <Flex flexDirection={'column'} gap={6}>
          <Text.Label fontWeight={600}>Related</Text.Label>
          <TextInput
            id="add-word-related-input"
            name="related"
            value={''}
            placeholder="words related to this one..."
            error={false}
            onChange={() => null}
          />
        </Flex>
      </Flex>
      <Flex gap={10} justifyContent={'flex-end'} marginTop={'auto'}>
        <Button.Transparent fontSize={1} fontWeight={600} opacity={0.5}>
          Cancel
        </Button.Transparent>
        <Button.TextButton fontSize={1} fontWeight={600} alignSelf={'flex-end'}>
          Submit
        </Button.TextButton>
      </Flex>
    </Card>
  );
}
function RequiredLabel({ text }: { text: string }) {
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
}
