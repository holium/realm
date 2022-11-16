import { FC, useState, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Icons } from 'renderer/components';
import { darken, transparentize } from 'polished';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/apps/store';
import { NewWalletScreen } from './index';

interface BackupProps {
  seedPhrase: string;
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

export const Backup: FC<BackupProps> = observer((props: BackupProps) => {
  const { theme } = useServices();
  const { walletApp } = useTrayApps();

  const panelBackground = darken(0.02, theme.currentTheme.windowColor);
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
          <Text variant="h5">Back up your Wallet</Text>
          <Text mt={3} variant="body">
            Your secret recovery phrase is used to restore your wallet.
          </Text>
          <Text mt={2} variant="body">
            Save these 12 words and store them in a safe place. Don’t share them
            with anyone.
          </Text>
        </Flex>
        <Flex
          mt={2}
          width="100%"
          flexDirection="column"
          background={panelBackground}
          border={panelBorder}
          borderRadius="9px"
        >
          <Box px={36} paddingTop={24}>
            <Text
              style={{
                filter: blurred ? 'blur(7px)' : undefined,
                wordSpacing: '7px',
                textAlign: 'center',
              }}
            >
              {props.seedPhrase}
            </Text>
          </Box>
          <Flex mt={5} width="100%" justifyContent="space-between">
            <Button
              variant="transparent"
              color={theme.currentTheme.iconColor}
              onClick={() => setBlurred(!blurred)}
            >
              <Icons name="Copy" color={theme.currentTheme.iconColor} mr={1} />
              {blurred ? 'Reveal' : 'Hide'}
            </Button>
            <Button
              variant="transparent"
              color={
                copied ? 'ui.intent.success' : theme.currentTheme.iconColor
              }
              onClick={copy}
            >
              {copied ? (
                'Copied!'
              ) : (
                <>
                  <Icons
                    mr={1}
                    name="Copy"
                    color={theme.currentTheme.iconColor}
                  />
                  Copy
                </>
              )}
            </Button>
          </Flex>
        </Flex>
        <Flex mt={2} width="100%" justifyContent="center">
          <Button onClick={() => props.setScreen(NewWalletScreen.PASSCODE)}>
            I wrote it down
          </Button>{' '}
          {/* TODO: link to confirm instead after demo */}
        </Flex>
      </Flex>
      <Flex
        position="absolute"
        top="582px"
        zIndex={999}
        onClick={() =>
          props.setScreen(
            walletApp.initialized
              ? NewWalletScreen.DETECTED_EXISTING
              : NewWalletScreen.CREATE
          )
        }
      >
        <Icons
          name="ArrowLeftLine"
          size={2}
          color={theme.currentTheme.iconColor}
        />
      </Flex>
    </>
  );
});
