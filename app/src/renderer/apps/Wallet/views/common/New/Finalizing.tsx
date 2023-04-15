import { FC, useEffect, useMemo } from 'react';
import { Flex, Spinner, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { useServices } from 'renderer/logic/store';

interface FinalizingProps {
  seedPhrase: string;
  passcode: number[];
}

export const Finalizing: FC<FinalizingProps> = observer(
  (props: FinalizingProps) => {
    const { theme } = useServices();
    const themeData = useMemo(
      () => getBaseTheme(theme.currentTheme),
      [theme.currentTheme.mode]
    );

    const initWallet = async () => {
      if (props.seedPhrase && props.passcode) {
        await WalletActions.setMnemonic(props.seedPhrase, props.passcode);
        await WalletActions.watchUpdates();
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
        <Text.Custom
          mt={6}
          color={themeData.colors.text.secondary}
          fontSize={3}
        >
          Creating wallet...
        </Text.Custom>
      </Flex>
    );
  }
);
