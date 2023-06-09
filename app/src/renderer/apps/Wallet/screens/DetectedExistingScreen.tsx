import { Box, Button, Flex, Icon, Text } from '@holium/design-system/general';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

type Props = {
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const DetectedExistingScreen = ({ setScreen }: Props) => (
  <Flex width="100%" height="100%" flexDirection="column">
    <Flex flex={4} flexDirection="column" alignItems="center" gap={20}>
      <Text.H4 variant="h4">Recover Wallet</Text.H4>
      <Text.Body px="10px" mb={5} variant="body" textAlign="center">
        An existing Realm wallet has been detected. You can either recover it
        using your seed phrase or create a new one.
      </Text.Body>
      <Box>
        <Button.TextButton
          onClick={() => setScreen(WalletOnboardingScreen.RECOVER_EXISTING)}
        >
          Recover Wallet
        </Button.TextButton>
      </Box>
      <Box>
        <Button.TextButton
          onClick={() => setScreen(WalletOnboardingScreen.BACKUP)}
        >
          Or create a new wallet
        </Button.TextButton>
      </Box>
    </Flex>
    <Flex mb={2} mx={3} justifyContent="center" alignItems="center">
      <Box>
        <Icon name="InfoCircle" />
      </Box>
      <Box>
        <Text.Hint ml={2} color="intent-caution" justifyContent="flex-end">
          You are using pre-release software. Only use for development purposes.
        </Text.Hint>
      </Box>
    </Flex>
  </Flex>
);
