import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { observer } from 'mobx-react';
import { ethers } from 'ethers';
import { Button, Flex, Text, Box, Icon } from '@holium/design-system';
import { transparentize } from 'polished';
import { NewWalletScreen } from './index';

interface BackupProps {
  seedPhrase: string;
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  setSeedPhrase: (phrase: string) => void;
}

const BackupPresenter = (props: BackupProps) => {
  useEffect(() => {
    props.setSeedPhrase(ethers.Wallet.createRandom().mnemonic.phrase);
  }, []);

  const panelBorder = `2px solid ${transparentize(0.9, '#000000')}`;

  const [blurred, setBlurred] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(props.seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 750);
  }

  return (
    <>
      <Flex
        px={16}
        height="100%"
        width="100%"
        flexDirection="column"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Flex flexDirection="column">
          <Text.H5 variant="h5">Back up your Wallet</Text.H5>
          <Text.Body mt={3} variant="body">
            Your secret recovery phrase is used to restore your wallet.
          </Text.Body>
          <Text.Body mt={2} variant="body">
            Save these 12 words and store them in a safe place. Don’t share them
            with anyone.
          </Text.Body>
        </Flex>
        <Flex
          mt={2}
          width="100%"
          flexDirection="column"
          border={panelBorder}
          borderRadius="9px"
        >
          <Box px={36} paddingTop={24}>
            <Text.Body
              style={{
                filter: blurred ? 'blur(7px)' : undefined,
                wordSpacing: '7px',
                textAlign: 'center',
              }}
            >
              {props.seedPhrase}
            </Text.Body>
          </Box>
          <Flex mt={5} width="100%" justifyContent="space-between">
            <Button.IconButton
              variant="transparent"
              onClick={() => setBlurred(!blurred)}
            >
              <Icon name="Copy" mr={1} />
              {blurred ? 'Reveal' : 'Hide'}
            </Button.IconButton>
            <Button.IconButton variant="transparent" onClick={copy}>
              {copied ? (
                'Copied!'
              ) : (
                <>
                  <Icon mr={1} name="Copy" />
                  Copy
                </>
              )}
            </Button.IconButton>
          </Flex>
        </Flex>
        <Flex mt={2} width="100%" justifyContent="center">
          <Button.TextButton
            onClick={() => props.setScreen(NewWalletScreen.CONFIRM)}
          >
            I wrote it down
          </Button.TextButton>
        </Flex>
      </Flex>
    </>
  );
};

export const Backup = observer(BackupPresenter);
