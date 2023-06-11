import { Button, Flex, Icon, Text } from '@holium/design-system/general';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

type Props = {
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const DetectedExistingScreen = ({ setScreen }: Props) => (
  <Flex flex={1} flexDirection="column">
    <Flex flex={1} flexDirection="column" gap="24px" justifyContent="center">
      <Flex flexDirection="column" gap={8} alignItems="center">
        <Text.H4 style={{ lineHeight: '1.5rem' }}>Recover wallet</Text.H4>
        <Text.Body textAlign="center" px="30px" opacity={0.7}>
          An existing Realm wallet has been detected. You can either recover it
          using your seed phrase or create a new one.
        </Text.Body>
      </Flex>
      <Flex flexDirection="column" gap={8} alignItems="center">
        <Button.Primary
          fontSize="14px"
          fontWeight="500"
          lineHeight="16px"
          style={{ padding: '5px 10px' }}
          onClick={() => setScreen(WalletOnboardingScreen.RECOVER_EXISTING)}
        >
          Recover wallet
        </Button.Primary>
        <Button.Secondary
          fontSize="14px"
          fontWeight="500"
          lineHeight="16px"
          style={{ padding: '5px 10px' }}
          onClick={() => setScreen(WalletOnboardingScreen.BACKUP)}
        >
          Create a new wallet
        </Button.Secondary>
      </Flex>
    </Flex>
    <Flex justifyContent="center" alignItems="center" gap="16px" p="8px">
      <Icon
        name="InfoCircleFilled"
        fill="intent-caution"
        width="18px"
        height="18px"
      />
      <Text.Hint color="intent-caution">
        You are using pre-release software. Only use for development purposes.
      </Text.Hint>
    </Flex>
  </Flex>
);
