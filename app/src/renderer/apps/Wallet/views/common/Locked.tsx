import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Icons } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { useServices } from 'renderer/logic/store';
import PasscodeInput from '../../components/PasscodeInput';
import { useTrayApps } from 'renderer/apps/store';

interface LockedProps {}

export const Locked: FC<LockedProps> = observer((props: LockedProps) => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();

  const unlock = () => {
    WalletActions.navigateBack();
  };

  return (
    <Flex width="100%" height="100%" flexDirection="column" alignItems="center">
      <Flex
        flex={1}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Icons name="Locked" size={36} />
        <Text mt={2} variant="h3">
          Wallet Locked
        </Text>
      </Flex>
      <Flex flex={2} pt={8} flexDirection="column" alignItems="center">
        <Text mb={8} variant="body">
          Enter your passcode to continue.
        </Text>
        <PasscodeInput checkStored={true} onSuccess={unlock} />
      </Flex>
    </Flex>
  );
});

export default Locked;
