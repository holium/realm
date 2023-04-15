import { Dispatch, SetStateAction, useState } from 'react';
import { observer } from 'mobx-react';
import { darken, transparentize } from 'polished';
import { Button, Flex, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';

import { NewWalletScreen } from './index';
import { WordPicker } from './WordPicker';

interface ConfirmProps {
  seedPhrase: string;
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

const ConfirmPresenter = (props: ConfirmProps) => {
  const [valid, setValid] = useState(false);
  const { theme } = useServices();

  const panelBackground = darken(0.02, theme.currentTheme.windowColor);
  const panelBorder = `2px solid ${transparentize(0.9, '#000000')}`;

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-evenly"
      alignItems="center"
    >
      <Flex flexDirection="column">
        <Text variant="h5">Confirm words</Text>
        <Text mt={3} variant="body">
          Verify you wrote the secret recovery phrase down correctly by clicking
          the following words in the correct order.
        </Text>
      </Flex>
      <Flex flexDirection="column" alignItems="center">
        <WordPicker
          seedPhrase={props.seedPhrase}
          border={panelBorder}
          background={panelBackground}
          onValidChange={setValid}
        />
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        <Button
          disabled={!valid}
          onClick={() => props.setScreen(NewWalletScreen.PASSCODE)}
        >
          Confirm
        </Button>
      </Flex>
    </Flex>
  );
};

export const Confirm = observer(ConfirmPresenter);
