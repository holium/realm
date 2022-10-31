import { FC, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Spinner } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';

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

    let initWallet = async () => {
      if (props.seedPhrase && props.passcode) {
        await WalletActions.setMnemonic(props.seedPhrase, props.passcode);
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
        <Text
          mt={6}
          variant="h6"
          color={themeData.colors.text.secondary}
          fontSize={3}
        >
          Creating wallet...
        </Text>
      </Flex>
    );
  }
);
