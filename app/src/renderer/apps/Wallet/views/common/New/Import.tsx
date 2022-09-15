import { FC, useMemo, Dispatch, SetStateAction, useState } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Label, Input } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { NewWalletScreen } from './index';

interface ImportProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>
  setSeedPhrase: (phrase: string) => void
}

export const Import: FC<ImportProps> = observer((props: ImportProps) => {
  const { desktop } = useServices();
  const theme = useMemo(() => getBaseTheme(desktop), [desktop.theme.mode]);
  const [phrase, setPhrase] = useState('');

  const saveSeedPhrase = () => {
    props.setSeedPhrase(phrase);
    props.setScreen(NewWalletScreen.PASSCODE); // TODO: change to confirm after demo
  };

  console.log(phrase)
  console.log('is valid? ', ethers.utils.isValidMnemonic(phrase))

  return (
    <Flex width="100%" height="100%" flexDirection="column">
        <Text mt={6} variant="h4">Import Wallet</Text>
        <Text mt={2} variant="body" color={theme.colors.text.secondary}>
          If you have an existing mnemonic seed phrase, you can load it into Realm now.
        </Text>
        <Flex mt={9} width="100%" flexDirection="column">
          <Label mb={3} required={true}>Seed phrase</Label>
          <Input height="72px" required={true} as="textarea" value={phrase} onChange={e => setPhrase(e.target.value)} autoFocus={true} />
          <Flex mt={7} width="100%">
            <Button width="100%" disabled={!ethers.utils.isValidMnemonic(phrase)} onClick={saveSeedPhrase}>Save</Button>
          </Flex>
        </Flex>
    </Flex>
  );
});
