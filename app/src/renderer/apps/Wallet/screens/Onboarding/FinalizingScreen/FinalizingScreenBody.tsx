import { Button, Flex, Spinner, Text } from '@holium/design-system/general';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

type Props = {
  stuck: boolean;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const FinalizingScreenBody = ({ stuck, setScreen }: Props) => (
  <Flex flex={1} flexDirection="column" justifyContent="center">
    <Flex width="100%" flexDirection="column" alignItems="center" gap="20px">
      <Spinner size={3} />
      <Text.Body opacity={0.7}>Creating wallet...</Text.Body>
      {stuck && (
        <Button.Transparent
          mt="12px"
          onClick={() => {
            setScreen(WalletOnboardingScreen.CANCEL);
          }}
        >
          <Text.Label opacity={0.5}>Stuck?</Text.Label>
        </Button.Transparent>
      )}
    </Flex>
  </Flex>
);
