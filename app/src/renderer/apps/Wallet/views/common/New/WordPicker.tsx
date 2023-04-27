import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Box, Flex, Text } from '@holium/design-system';

interface WordPickerProps {
  seedPhrase: string;
  background?: string;
  border: string;
  onValidChange: any;
}

const WordPickerPresenter = ({
  seedPhrase,
  background,
  border,
  onValidChange,
}: WordPickerProps) => {
  const [state, setState] = useState<{
    wordsToSelect: Array<{ word: string; available: boolean }>;
    selectedWords: string[];
  }>({ wordsToSelect: [], selectedWords: [] });
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
    const Available = ({ word, onClick }: any) => (
      <Box
        m="4px"
        px="8px"
        py="6px"
        border={border}
        borderRadius={6}
        onClick={onClick}
      >
        <Text.Body variant="body">{word}</Text.Body>
      </Box>
    );
    const Unavailable = ({ word }: any) => (
      <Box m="6px" px="8px" py="6px" borderRadius={6}>
        <Text.Body variant="body" style={{ textDecoration: 'line-through' }}>
          {word}
        </Text.Body>
      </Box>
    );

    return (
      <Flex justifyContent="space-evenly" alignItems="center" flexWrap="wrap">
        {words.map(
          (element: { word: string; available: boolean }, index: number) =>
            element.available ? (
              <Available
                key={index}
                word={element.word}
                onClick={() => selectWord(index)}
                background={background}
                border={border}
              />
            ) : (
              <Unavailable key={index} word={element.word} />
            )
        )}
      </Flex>
    );
  };

  const Display = ({ words, border }: any) => {
    const Spacer = ({ border }: any) => (
      <Box m={1} height={24} width={64} borderBottom={border} />
    );
    const Next = () => <Box m={1} height={24} width={64} />;
    const Word = ({ border, removeable, children }: any) => (
      <Flex
        m={1}
        height={24}
        width={64}
        borderBottom={border}
        justifyContent="center"
        alignItems="center"
      >
        <Text.Body variant="body">{children}</Text.Body>
        {removeable ? (
          <Text.Body ml="6px" variant="body" onClick={deselectWord}>
            x
          </Text.Body>
        ) : (
          <></>
        )}
      </Flex>
    );

    return (
      <Flex
        justifyContent="space-evenly"
        alignItems="center"
        flexWrap="wrap"
        border={border}
        borderRadius={6}
      >
        {[...Array(12).keys()].map((index) => {
          if (index < words.length - 1)
            return (
              <Word key={index} border={border}>
                {words[index]}
              </Word>
            );

          if (index === words.length - 1)
            return (
              <Word key={index} removeable={true} border={border}>
                {words[index]}
              </Word>
            );

          if (index === words.length) return <Next key={index} />;

          return <Spacer key={index} border={border} />;
        })}
      </Flex>
    );
  };

  return (
    <>
      <Select words={state.wordsToSelect} border={border} />
      <Display words={state.selectedWords} border={border} />
      <Text.Body variant="body">{error}</Text.Body>
    </>
  );
};

export const WordPicker = observer(WordPickerPresenter);
