import { useState, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Button, Flex, Text } from '@holium/design-system';
import { transparentize } from 'polished';
import { WordPicker } from './WordPicker';
import { NewWalletScreen } from './index';

interface ConfirmProps {
  seedPhrase: string;
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

const ConfirmPresenter = (props: ConfirmProps) => {
  const [valid, setValid] = useState(false);

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
        <Text.H5 variant="h5">Confirm words</Text.H5>
        <Text.Body mt={3} variant="body">
          Verify you wrote the secret recovery phrase down correctly by clicking
          the following words in the correct order.
        </Text.Body>
      </Flex>
      <Flex flexDirection="column" alignItems="center">
        <WordPicker
          seedPhrase={props.seedPhrase}
          border={panelBorder}
          onValidChange={setValid}
        />
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        <Button.TextButton
          disabled={!valid}
          onClick={() => props.setScreen(NewWalletScreen.PASSCODE)}
        >
          Confirm
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};

export const Confirm = observer(ConfirmPresenter);
