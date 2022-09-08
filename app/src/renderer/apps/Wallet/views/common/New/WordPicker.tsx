import { FC, useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Icons, TextButton } from 'renderer/components';
import { darken, lighten, transparentize } from 'polished';
import { useTrayApps } from 'renderer/logic/apps/store';
import { Wallet } from '../../../lib/wallet';
import { constructSampleWallet } from '../../../store';
import { WalletCard } from '../WalletCard';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { theme } from 'renderer/theme';
import { useServices } from 'renderer/logic/store';

interface WordPickerProps {
  seedPhrase: string
  background: string
  border: string
  onValidChange: any
}

export const WordPicker: FC<WordPickerProps> = (props: WordPickerProps) => {
  let [state, setState] = useState<{ wordsToSelect: {word: string, available: boolean}[], selectedWords: string[] }>({ wordsToSelect: [], selectedWords: [] });
  const { desktop } = useServices();

  const panelBackground = darken(0.02, desktop.theme!.windowColor);
  const panelBorder = `2px solid ${transparentize(0.9, '#000000')}`;

  useEffect(() => {
    let words = props.seedPhrase.trim().split(' ').sort((a, b) => a.localeCompare(b));
    let wordsToSelect = words.map(word => ({ word, available: true }));
    let selectedWords: string[] = [];
    setState({ wordsToSelect, selectedWords });
  }, [props.seedPhrase])

  function selectWord(index: number) {
    let word = '';
    let updatedWordsToSelect = state.wordsToSelect.map((element, i) => {
      console.log(element)
      if (i === index) {
        word = element.word;
        element.available = false;
      }

      return element;
    });

    let updatedSelectedWords = state.selectedWords;
    updatedSelectedWords.push(word);

    setState({
      wordsToSelect: updatedWordsToSelect,
      selectedWords: updatedSelectedWords
    });

    if (updatedSelectedWords.join(' ') === props.seedPhrase) {
      props.onValidChange(true);
    }
  }

  function deselectWord() {
    let updatedSelectedWords = state.selectedWords;
    let word = updatedSelectedWords.pop();

    let wordNotFound = true;
    let updatedWordsToSelect = state.wordsToSelect.map((element) => {
      if (wordNotFound && element.word === word) {
        element.available = true;
      }
      return element;
    });

    setState({
      wordsToSelect: updatedWordsToSelect,
      selectedWords: updatedSelectedWords
    });
  }

  let Select = (props: any) => {
    let Available = (props: any) => (
      <Box m="4px" px="8px" py="6px" border={props.border} backgroundColor={props.background} borderRadius={6} onClick={props.onClick}>
        <Text variant="body">{props.word}</Text>
      </Box>
    )
    let Unavailable = (props: any) => (
      <Box m="6px" px="8px" py="6px" borderRadius={6}>
        <Text variant="body" color={desktop.theme.iconColor} style={{ textDecoration: 'line-through' }}>{props.word}</Text>
      </Box>
    )

    return (
      <Flex justifyContent="space-evenly" alignItems="center" flexWrap="wrap">
        {props.words.map((element: { word: string, available: boolean }, index: number) => (
          element.available
            ? <Available key={index} word={element.word} onClick={() => selectWord(index)} background={props.background} border={props.border} />
            : <Unavailable key={index} word={element.word} theme={desktop.theme} />
        ))}
      </Flex>
    )
  }

  let Display = (props: any) => {
    let Spacer = (props: any) => (
      <Box m={1} height={24} width={64} borderBottom={props.border} />
    )
    let Next = (props: any) => (
      <Box m={1} height={24} width={64} borderBottom={`2px solid ${transparentize(0.5, theme.light.colors.brand.primary)}`} background={transparentize(0.8, theme.light.colors.brand.primary)} />
    )
    let Word = (props: any) => (
      <Flex m={1} height={24} width={64} borderBottom={props.border} justifyContent="center" alignItems="center">
        <Text variant="body">{props.children}</Text>
        {
          props.removeable
          ? <Text ml="6px" variant="body" color={desktop.theme.iconColor} onClick={deselectWord}>x</Text>
          : <></>
        }
      </Flex>
    )

    return (
      <Flex mt={16} p={16} justifyContent="space-evenly" alignItems="center" flexWrap="wrap" border={props.border} backgroundColor={props.background} borderRadius={6}>
        { [...Array(12).keys()].map(index => {
          if (index < (props.words.length - 1))
            return <Word key={index} border={props.border}>{ props.words[index] }</Word>

          if (index === (props.words.length - 1))
            return <Word key={index} removeable={true} border={props.border} theme={desktop.theme}>{ props.words[index] }</Word>

          if (index === props.words.length)
            return <Next key={index} />

          return <Spacer key={index} border={props.border} />
        })}
      </Flex>
    )
  }

  return (
    <>
      <Select words={state.wordsToSelect} background={props.background} border={props.border} theme={desktop.theme} />
      <Display words={state.selectedWords} border={props.border} background={props.background} theme={desktop.theme} />
    </>
  )
}
