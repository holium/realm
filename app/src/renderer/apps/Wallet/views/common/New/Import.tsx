import { Dispatch, SetStateAction, useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { Button, Flex, Text, TextInput } from '@holium/design-system';
import { NewWalletScreen } from './index';

const NoResize = styled(Flex)`
  textarea {
    resize: none;
  }
`;

interface ImportProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  setSeedPhrase: (phrase: string) => void;
}

const ImportPresenter = (props: ImportProps) => {
  const [phrase, setPhrase] = useState('');

  const saveSeedPhrase = () => {
    props.setSeedPhrase(phrase);
    props.setScreen(NewWalletScreen.PASSCODE);
  };

  return (
    <NoResize width="100%" height="100%" flexDirection="column" gap={10}>
      <Text.H4 mt={6} variant="h4">
        Import Wallet
      </Text.H4>
      <Text.Body mt={2} variant="body">
        If you have an existing mnemonic seed phrase, you can load it into Realm
        now.
      </Text.Body>
      {/*<FormControl.FieldSet mt={9} width="100%" flexDirection="column">
        <FormControl.Field>*/}
      <Text.Label mb={1}>Seed phrase</Text.Label>
      <TextInput
        id="seed-phrase"
        name="seed-phrase"
        height="72px"
        required={true}
        type="textarea"
        value={phrase}
        cols={50}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPhrase(e.target.value)
        }
        // autoFocus={true}
      />
      {/*</FormControl.Field>*/}
      <Flex width="100%">
        <Button.TextButton
          width="100%"
          disabled={!ethers.utils.isValidMnemonic(phrase)}
          onClick={saveSeedPhrase}
        >
          Save
        </Button.TextButton>
      </Flex>
      {/*</FormControl.FieldSet>*/}
    </NoResize>
  );
};

export const Import = observer(ImportPresenter);
