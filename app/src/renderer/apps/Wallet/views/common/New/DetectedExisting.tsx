import { FC, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import {
  Button,
  Flex,
  Text,
  Box,
  Icons,
  TextButton,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { NewWalletScreen } from './index';

interface DetectedExistingProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

export const DetectedExisting: FC<DetectedExistingProps> = observer((props: DetectedExistingProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);


  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Flex flex={4} flexDirection="column" alignItems="center">
        <Text mt={6} variant="h4">
          Recover Wallet
        </Text>
        <Text
          px="10px"
          mt={3}
          mb={5}
          variant="body"
          color={baseTheme.colors.text.secondary}
          textAlign="center"
        >
          An existing Realm wallet has been detected. You can either recover it using your seed phrase or create a new one.
        </Text>
        <Box mt={9}>
          <Button onClick={() => props.setScreen(NewWalletScreen.RECOVER_EXISTING)}>
            Recover Wallet
          </Button>
        </Box>
        <Box mt={3}>
          <TextButton
            textColor={baseTheme.colors.text.secondary}
            onClick={() => props.setScreen(NewWalletScreen.BACKUP)}
          >
            Or create a new wallet
          </TextButton>
        </Box>
      </Flex>
      <Flex mb={6} mx={3} justifyContent="center" alignItems="center">
        <Box>
          <Icons name="InfoCircle" color={baseTheme.colors.brand.secondary} />
        </Box>
        <Box>
          <Text
            ml={2}
            variant="hint"
            justifyContent="flex-end"
            color={baseTheme.colors.brand.secondary}
          >
            You are using pre-release software. Only use for development
            purposes.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
});

export default DetectedExisting;
