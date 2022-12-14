import { FC } from 'react';
import { observer } from 'mobx-react';

import { Flex, Box, Text } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../../lib/helpers';
import { TransactionPane } from './Pane';
import {
  BitcoinWalletType,
  EthWalletType,
  ERC20Type,
  ProtocolType,
} from 'os/services/tray/wallet-lib/wallet.model';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

interface SendTransactionProps {
  hidden: boolean;
  onScreenChange: any;
  close: () => void;
  wallet: EthWalletType | BitcoinWalletType;
  coin?: ERC20Type | null;
}

export const SendTransaction: FC<SendTransactionProps> = observer(
  (props: SendTransactionProps) => {
    const { theme } = useServices();
    const { walletApp } = useTrayApps();
    const themeData = getBaseTheme(theme.currentTheme);
    const Seperator = () => (
      <Flex mt={6} position="relative" width="100%" justifyContent="center">
        <Box
          position="absolute"
          width="300px"
          height="1px"
          left="-10px"
          background={themeData.colors.bg.primary}
        />
        <Flex
          position="absolute"
          bottom="-12px"
          height="25px"
          width="80px"
          justifyContent="center"
          alignItems="center"
          borderRadius="50px"
          background={
            theme.currentTheme.mode === 'light' ? '#EAF3FF' : '#262f3b'
          }
        >
          <Text variant="body" color={themeData.colors.brand.primary}>
            Send{' '}
            {props.coin
              ? props.coin.name
              : walletApp.navState.protocol === ProtocolType.UQBAR
              ? 'zigs'
              : abbrMap[walletApp.navState.network as 'bitcoin' | 'ethereum']}
          </Text>
        </Flex>
      </Flex>
    );

    return (
      <Box width="100%" hidden={props.hidden}>
        <Seperator />
        <TransactionPane
          max={
            props.coin
              ? Number(props.coin.balance)
              : Number(
                  props.wallet.data.get(walletApp.navState.protocol)!.balance
                )
          }
          onScreenChange={props.onScreenChange}
          close={props.close}
          coin={props.coin}
        />
      </Box>
    );
  }
);
