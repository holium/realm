import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Box } from '@holium/design-system';

interface WordPickerProps {
  seedPhrase: string;
  background: string;
  border: string;
  onValidChange: any;
}

export const WordPicker: FC<WordPickerProps> = observer(
  (props: WordPickerProps) => {
    const [state, setState] = useState<{
      wordsToSelect: Array<{ word: string; available: boolean }>;
      selectedWords: string[];
    }>({ wordsToSelect: [], selectedWords: [] });
    const [error, setError] = useState('');

    useEffect(() => {
      const words = props.seedPhrase
        .trim()
        .split(' ')
        .sort((a, b) => a.localeCompare(b));
      const wordsToSelect = words.map((word) => ({ word, available: true }));
      const selectedWords: string[] = [];
      setState({ wordsToSelect, selectedWords });
    }, [props.seedPhrase]);

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

      if (updatedSelectedWords.join(' ') === props.seedPhrase) {
        setError('');
        props.onValidChange(true);
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

    const Select = (props: any) => {
      const Available = (props: any) => (
        <Box
          m="4px"
          px="8px"
          py="6px"
          border={props.border}
          borderRadius={6}
          onClick={props.onClick}
        >
          <Text.Body variant="body">{props.word}</Text.Body>
        </Box>
      );
      const Unavailable = (props: any) => (
        <Box m="6px" px="8px" py="6px" borderRadius={6}>
          <Text.Body variant="body" style={{ textDecoration: 'line-through' }}>
            {props.word}
          </Text.Body>
        </Box>
      );

      return (
        <Flex justifyContent="space-evenly" alignItems="center" flexWrap="wrap">
          {props.words.map(
            (element: { word: string; available: boolean }, index: number) =>
              element.available ? (
                <Available
                  key={index}
                  word={element.word}
                  onClick={() => selectWord(index)}
                  background={props.background}
                  border={props.border}
                />
              ) : (
                <Unavailable key={index} word={element.word} />
              )
          )}
        </Flex>
      );
    };

    const Display = (props: any) => {
      const Spacer = (props: any) => (
        <Box m={1} height={24} width={64} borderBottom={props.border} />
      );
      const Next = () => <Box m={1} height={24} width={64} />;
      const Word = (props: any) => (
        <Flex
          m={1}
          height={24}
          width={64}
          borderBottom={props.border}
          justifyContent="center"
          alignItems="center"
        >
          <Text.Body variant="body">{props.children}</Text.Body>
          {props.removeable ? (
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
          mt={16}
          p={16}
          justifyContent="space-evenly"
          alignItems="center"
          flexWrap="wrap"
          border={props.border}
          borderRadius={6}
        >
          {[...Array(12).keys()].map((index) => {
            if (index < props.words.length - 1)
              return (
                <Word key={index} border={props.border}>
                  {props.words[index]}
                </Word>
              );

            if (index === props.words.length - 1)
              return (
                <Word key={index} removeable={true} border={props.border}>
                  {props.words[index]}
                </Word>
              );

            if (index === props.words.length) return <Next key={index} />;

            return <Spacer key={index} border={props.border} />;
          })}
        </Flex>
      );
    };

    return (
      <>
        <Select
          words={state.wordsToSelect}
          background={props.background}
          border={props.border}
        />
        <Display
          words={state.selectedWords}
          border={props.border}
          background={props.background}
        />
        <Text.Body mt={1} variant="body">
          {error}
        </Text.Body>
      </>
    );
  }
);
