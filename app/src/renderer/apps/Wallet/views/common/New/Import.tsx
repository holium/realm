import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import { TextInput } from '@holium/design-system';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { Button, Flex, FormControl, Label, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import styled from 'styled-components';

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
  const { theme } = useServices();
  const themeData = useMemo(
    () => getBaseTheme(theme.currentTheme),
    [theme.currentTheme]
  );
  const [phrase, setPhrase] = useState('');

  const saveSeedPhrase = () => {
    props.setSeedPhrase(phrase);
    props.setScreen(NewWalletScreen.PASSCODE);
  };

  return (
    <NoResize width="100%" height="100%" flexDirection="column">
      <Text mt={6} variant="h4">
        Import Wallet
      </Text>
      <Text mt={2} variant="body" color={themeData.colors.text.secondary}>
        If you have an existing mnemonic seed phrase, you can load it into Realm
        now.
      </Text>
      <FormControl.FieldSet mt={9} width="100%" flexDirection="column">
        <FormControl.Field>
          <Label mb={1} required={true}>
            Seed phrase
          </Label>
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
        </FormControl.Field>
        <Flex mt={7} width="100%">
          <Button
            width="100%"
            disabled={!ethers.utils.isValidMnemonic(phrase)}
            onClick={saveSeedPhrase}
          >
            Save
          </Button>
        </Flex>
      </FormControl.FieldSet>
    </NoResize>
  );
};

export const Import = observer(ImportPresenter);
