import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Button, Flex, Text, TextInput } from '@holium/design-system';

import { NewWalletScreen } from './EthNew';

const NoResize = styled(Flex)`
  textarea {
    resize: none;
  }
`;

interface ImportProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  setSeedPhrase: (phrase: string) => void;
}

const ImportPresenter = ({ setScreen, setSeedPhrase }: ImportProps) => {
  const [phrase, setPhrase] = useState('');

  const saveSeedPhrase = () => {
    setSeedPhrase(phrase);
    setScreen(NewWalletScreen.PASSCODE);
  };

  return (
    <NoResize
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex flexDirection="column" gap={12}>
        <Text.H4 mt={24} variant="h4">
          Import Wallet
        </Text.H4>
        <Text.Body mt={2} variant="body">
          If you have an existing mnemonic seed phrase, you can load it into
          Realm now.
        </Text.Body>
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
        />
      </Flex>
      <Flex width="100%" gap="16px">
        <Button.Transparent
          flex={1}
          justifyContent="center"
          onClick={() => setScreen(NewWalletScreen.CREATE)}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          flex={1}
          justifyContent="center"
          disabled={!ethers.utils.isValidMnemonic(phrase)}
          onClick={saveSeedPhrase}
        >
          Save
        </Button.TextButton>
      </Flex>
    </NoResize>
  );
};

export const Import = observer(ImportPresenter);
