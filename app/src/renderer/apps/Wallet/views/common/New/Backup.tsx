import { FC, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Icons } from 'renderer/components';
import { darken, transparentize } from 'polished';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { NewWalletScreen } from './index';

interface BackupProps {
  seedPhrase: string
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>
}

export const Backup: FC<BackupProps> = observer((props: BackupProps) => {
  let { setTrayAppDimensions, dimensions } = useTrayApps();
  const { desktop } = useServices();

  const panelBackground = darken(0.02, desktop.theme!.windowColor);
  const panelBorder = `2px solid ${transparentize(0.9, '#000000')}`;

  useEffect(() => {
    let prevDims = dimensions;
    console.log(prevDims.height, prevDims.width)
    setTrayAppDimensions({ height: 440, width: 320 });

    return () => {
      setTrayAppDimensions(prevDims);
    }
  }, [])

  let [blurred, setBlurred] = useState(false);
  let [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(props.seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 750);
  }

  return (
    <Flex px={16} height="100%" width="100%" flexDirection="column" justifyContent="space-evenly" alignItems="center">
      <Flex flexDirection="column">
        <Text variant="h5">Back up your Wallet</Text>
        <Text mt={3} variant="body">
          Your secret recovery phrase is used to restore your wallet.
        </Text>
        <Text mt={2} variant="body">
          Save these 12 words and store them in a safe place. Don’t share them with anyone.
        </Text>
      </Flex>
      <Flex mt={2} width="100%" flexDirection="column" background={panelBackground} border={panelBorder} borderRadius="9px">
        <Box px={36} paddingTop={24}>
          <Text style={{ filter: blurred ? 'blur(7px)' : undefined, wordSpacing: '7px', textAlign: 'center'  }}>
            {props.seedPhrase}
          </Text>
        </Box>
        <Flex mt={5} width="100%" justifyContent="space-between">
          <Button variant="transparent" color={desktop.theme.iconColor} onClick={() => setBlurred(!blurred)}>
            <Icons name="Copy" color={desktop.theme.iconColor} mr={1} />
            {blurred ? 'Reveal' : 'Hide'}
          </Button>
          <Button variant="transparent" color={copied ? 'ui.intent.success' : desktop.theme.iconColor} onClick={copy}>
            {
              copied
              ? 'Copied!'
              : (
                <>
                  <Icons mr={1} name="Copy" color={desktop.theme.iconColor} />
                  Copy
                </>
              )
            }
          </Button>
        </Flex>
      </Flex>
      <Flex mt={2} width="100%" justifyContent="center">
        <Button onClick={() => props.setScreen(NewWalletScreen.PASSCODE/*CONFIRM*/)}>I wrote it down</Button>
      </Flex>
    </Flex>
  );
});
