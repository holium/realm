import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Spinner } from '@holium/design-system';
import { useShipStore } from 'renderer/stores/ship.store';

interface FinalizingProps {
  seedPhrase: string;
  passcode: number[];
}

export const Finalizing: FC<FinalizingProps> = observer(
  (props: FinalizingProps) => {
    const { walletStore } = useShipStore();
    const initWallet = async () => {
      if (props.seedPhrase && props.passcode) {
        await walletStore.setMnemonic(props.seedPhrase, props.passcode);
        await walletStore.watchUpdates();
      }
    };
    useEffect(() => {
      initWallet();
    }, [props.seedPhrase, props.passcode]);

    return (
      <Flex
        width="100%"
        height="100%"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size={3} />
        <Text.Custom mt={6} fontSize={3}>
          Creating wallet...
        </Text.Custom>
      </Flex>
    );
  }
);
