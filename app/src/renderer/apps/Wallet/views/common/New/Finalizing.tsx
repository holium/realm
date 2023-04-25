import { FC, useEffect } from 'react';
import { Flex, Spinner, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { WalletView } from 'renderer/stores/models/wallet.model';
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
        await walletStore.navigate(WalletView.LIST);
        // await walletStore.watchUpdates();
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
