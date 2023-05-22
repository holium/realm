import { useEffect, useState } from 'react';

import { Box, Flex, Icon, Text } from '@holium/design-system/general';

type Word = { word: string; available: boolean };

type WordPickerState = {
  wordsToSelect: Word[];
  selectedWords: string[];
};

type Props = {
  seedPhrase: string;
  onValidChange: (valid: boolean) => void;
};

export const WordPicker = ({ seedPhrase, onValidChange }: Props) => {
  const [state, setState] = useState<WordPickerState>({
    wordsToSelect: [],
    selectedWords: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const words = seedPhrase
      .trim()
      .split(' ')
      .sort((a, b) => a.localeCompare(b));
    const wordsToSelect = words.map((word) => ({ word, available: true }));
    const selectedWords: string[] = [];
    setState({ wordsToSelect, selectedWords });
  }, [seedPhrase]);

  function selectWord(index: number) {
    let word = '';
    const updatedWordsToSelect = state.wordsToSelect.map((element, i) => {
      if (i === index) {
        word = element.word;
        element.available = false;
      }

      return element;
    });

    const updatedSelectedWords = state.selectedWords;
    updatedSelectedWords.push(word);

    setState({
      wordsToSelect: updatedWordsToSelect,
      selectedWords: updatedSelectedWords,
    });

    if (updatedSelectedWords.join(' ') === seedPhrase) {
      setError('');
      onValidChange(true);
    } else if (updatedWordsToSelect.every((item) => !item.available)) {
      setError('Recovery phrase does not match.');
    } else {
      setError('');
    }
  }

  function deselectWord() {
    const updatedSelectedWords = state.selectedWords;
    const word = updatedSelectedWords.pop();

    const wordNotFound = true;
    const updatedWordsToSelect = state.wordsToSelect.map((element) => {
      if (wordNotFound && element.word === word) {
        element.available = true;
      }
      return element;
    });

    setState({
      wordsToSelect: updatedWordsToSelect,
      selectedWords: updatedSelectedWords,
    });
  }

  const Select = ({ words }: { words: Word[] }) => {
    return (
      <Flex justifyContent="space-between" flexWrap="wrap">
        {words.map((word, index: number) => (
          <Box
            key={`${index}-${word.word}-select`}
            m="4px"
            px="8px"
            py="6px"
            border="1px solid rgba(var(--rlm-border-rgba))"
            background="rgba(var(--rlm-border-rgba), 0.1)"
            borderRadius={6}
            opacity={word.available ? 1 : 0.3}
            style={{ cursor: 'pointer' }}
            onClick={() => selectWord(index)}
          >
            <Text.Body variant="body">{word.word}</Text.Body>
          </Box>
        ))}
      </Flex>
    );
  };

  const Display = ({ selectedWords }: { selectedWords: string[] }) => {
    const Spacer = () => (
      <Box
        height={24}
        width={64}
        borderBottom="1px solid rgba(var(--rlm-border-rgba))"
      />
    );
    const Current = () => (
      <Box
        height={24}
        width={64}
        borderBottom="1px solid rgba(var(--rlm-accent-rgba))"
        background="rgba(var(--rlm-accent-rgba), 0.1)"
      />
    );
    const Word = ({
      removeable,
      children,
    }: {
      removeable?: boolean;
      children: string;
    }) => (
      <Flex
        gap="2px"
        height={24}
        width={64}
        borderBottom="1px solid rgba(var(--rlm-border-rgba))"
        justifyContent="center"
        alignItems="center"
        style={{ cursor: removeable ? 'pointer' : 'default' }}
        onClick={removeable ? deselectWord : undefined}
      >
        <Text.Body variant="body">{children}</Text.Body>
        {removeable ? (
          <Icon name="Close" size={12} fill="text" opacity={0.3} />
        ) : (
          <></>
        )}
      </Flex>
    );

    return (
      <Flex
        justifyContent="space-evenly"
        gap="8px"
        alignItems="center"
        flexWrap="wrap"
        p="16px 16px 24px 16px"
        border="1px solid rgba(var(--rlm-border-rgba))"
        background="rgba(var(--rlm-border-rgba), 0.1)"
        borderRadius={6}
      >
        {seedPhrase.split(' ').map((word, index) => {
          if (index < selectedWords.length - 1)
            return <Word key={`${index}-${word}-selected`}>{word}</Word>;

          if (index === selectedWords.length - 1)
            return (
              <Word key={`${index}-${word}-selected`} removeable={true}>
                {word}
              </Word>
            );

          if (index === selectedWords.length)
            return <Current key={`${index}-${word}-current`} />;

          return <Spacer key={`${index}-${word}-spacer`} />;
        })}
      </Flex>
    );
  };

  return (
    <Flex flexDirection="column" gap="16px" mt="14px">
      <Select words={state.wordsToSelect} />
      <Display selectedWords={state.selectedWords} />
      <Text.Body textAlign="center" color="intent-alert">
        {error}
      </Text.Body>
    </Flex>
  );
};
