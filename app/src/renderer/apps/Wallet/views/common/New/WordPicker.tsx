import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Box } from 'renderer/components';
import { transparentize } from 'polished';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';

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
    const { theme } = useServices();
    const themeData = getBaseTheme(theme.currentTheme);

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
      } else if (updatedWordsToSelect.every(item => !item.available)) {
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
          backgroundColor={props.background}
          borderRadius={6}
          onClick={props.onClick}
        >
          <Text variant="body">{props.word}</Text>
        </Box>
      );
      const Unavailable = (props: any) => (
        <Box m="6px" px="8px" py="6px" borderRadius={6}>
          <Text
            variant="body"
            color={theme.currentTheme.iconColor}
            style={{ textDecoration: 'line-through' }}
          >
            {props.word}
          </Text>
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
                <Unavailable
                  key={index}
                  word={element.word}
                  theme={theme.currentTheme}
                />
              )
          )}
        </Flex>
      );
    };

    const Display = (props: any) => {
      const Spacer = (props: any) => (
        <Box m={1} height={24} width={64} borderBottom={props.border} />
      );
      const Next = (props: any) => (
        <Box
          m={1}
          height={24}
          width={64}
          borderBottom={`2px solid ${transparentize(
            0.5,
            themeData.colors.brand.primary
          )}`}
          background={transparentize(0.8, themeData.colors.brand.primary)}
        />
      );
      const Word = (props: any) => (
        <Flex
          m={1}
          height={24}
          width={64}
          borderBottom={props.border}
          justifyContent="center"
          alignItems="center"
        >
          <Text variant="body">{props.children}</Text>
          {props.removeable ? (
            <Text
              ml="6px"
              variant="body"
              color={theme.currentTheme.iconColor}
              onClick={deselectWord}
            >
              x
            </Text>
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
          backgroundColor={props.background}
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
                <Word
                  key={index}
                  removeable={true}
                  border={props.border}
                  theme={theme.currentTheme}
                >
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
          theme={theme.currentTheme}
        />
        <Display
          words={state.selectedWords}
          border={props.border}
          background={props.background}
          theme={theme.currentTheme}
        />
        <Text mt={1} variant="body" color={themeData.colors.text.error}>
          {error}
        </Text>
      </>
    );
  }
);
