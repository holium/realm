import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Box, Flex, Icon, Text } from '@holium/design-system/general';

type WordPickerState = {
  wordsToSelect: Array<{ word: string; available: boolean }>;
  selectedWords: string[];
};

type Props = {
  seedPhrase: string;
  onValidChange: (valid: boolean) => void;
};

const WordPickerPresenter = ({ seedPhrase, onValidChange }: Props) => {
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

  const Select = ({ words }: any) => {
    return (
      <Flex justifyContent="space-between" flexWrap="wrap">
        {words.map(
          (element: { word: string; available: boolean }, index: number) => (
            <Box
              m="4px"
              px="8px"
              py="6px"
              border="1px solid rgba(var(--rlm-border-rgba))"
              background="rgba(var(--rlm-border-rgba), 0.1)"
              borderRadius={6}
              opacity={element.available ? 1 : 0.3}
              style={{ cursor: 'pointer' }}
              onClick={() => selectWord(index)}
            >
              <Text.Body variant="body">{element.word}</Text.Body>
            </Box>
          )
        )}
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
    const Word = ({ removeable, children }: any) => (
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
        {seedPhrase.split(' ').map((_, index) => {
          if (index < selectedWords.length - 1)
            return <Word key={index}>{selectedWords[index]}</Word>;

          if (index === selectedWords.length - 1)
            return (
              <Word key={index} removeable={true}>
                {selectedWords[index]}
              </Word>
            );

          if (index === selectedWords.length) return <Current key={index} />;

          return <Spacer key={index} />;
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

export const WordPicker = observer(WordPickerPresenter);
