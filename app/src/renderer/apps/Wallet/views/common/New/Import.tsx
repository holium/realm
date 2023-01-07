import { FC, useMemo, Dispatch, SetStateAction, useState } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import {
  Button,
  Flex,
  Text,
  Icons,
  Label,
  FormControl,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { NewWalletScreen } from './index';
import { TextInput } from '@holium/design-system';

interface ImportProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  setSeedPhrase: (phrase: string) => void;
}

export const Import: FC<ImportProps> = observer((props: ImportProps) => {
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

  console.log(phrase);
  console.log('is valid? ', ethers.utils.isValidMnemonic(phrase));

  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Text mt={6} variant="h4">
        Import Wallet
      </Text>
      <Text mt={2} variant="body" color={themeData.colors.text.secondary}>
        If you have an existing mnemonic seed phrase, you can load it into Realm
        now.
      </Text>
      <FormControl.FieldSet mt={9} width="100%" flexDirection="column">
        <FormControl.Field>
          <Label mb={3} required={true}>
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
            onChange={(e) => setPhrase(e.target.value)}
            autoFocus={true}
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
      <Flex
        position="absolute"
        top="582px"
        zIndex={999}
        onClick={() => props.setScreen(NewWalletScreen.CREATE)}
      >
        <Icons
          name="ArrowLeftLine"
          size={2}
          color={theme.currentTheme.iconColor}
        />
      </Flex>
    </Flex>
  );
});
