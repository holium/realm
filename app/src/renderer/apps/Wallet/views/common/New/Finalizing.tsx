import { FC, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Spinner } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface FinalizingProps {
  seedPhrase: string
  passcode: string
}

export const Finalizing: FC<FinalizingProps> = observer((props: FinalizingProps) => {
  const { desktop } = useServices();
  const theme = useMemo(() => getBaseTheme(desktop), [desktop.theme.mode]);

  let initWallet = async () => {
    if (props.seedPhrase && props.passcode) {
      await WalletActions.setMnemonic(props.seedPhrase, props.passcode);
    }
  }
  useEffect(() => { initWallet() }, [props.seedPhrase, props.passcode]);

  return (
    <Flex width="100%" height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Spinner size={3} />
      <Text mt={6} variant="h6" color={theme.colors.text.secondary} fontSize={3}>
        Creating wallet...
      </Text>
    </Flex>
  );
});
