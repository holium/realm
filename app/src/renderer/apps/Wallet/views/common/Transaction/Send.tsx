import { FC } from 'react';
import { observer } from 'mobx-react';

import { Flex, Box, Text } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../../lib/helpers';
import {
  BitcoinWalletType,
  EthWalletType,
  ERC20Type,
  ProtocolType,
} from 'os/services/tray/wallet-lib/wallet.model';
import { TransactionPane } from './Pane';

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
  onConfirm: () => void;
  transactionAmount: any;
  setTransactionAmount: any;
  transactionRecipient: any;
  setTransactionRecipient: any;
}

export const SendTransaction: FC<SendTransactionProps> = observer(
  (props: SendTransactionProps) => {
    const { theme } = useServices();
    const { walletApp } = useTrayApps();
    const themeData = getBaseTheme(theme.currentTheme);
    const pendingTx = walletApp.navState.protocol === ProtocolType.UQBAR ? walletApp.uqTx : null;
    const uqbarContract: boolean = pendingTx ? 'noun' in pendingTx.action : false;
    const Seperator = () => (
      <Flex mt={6} position="relative" width="100%" justifyContent="center">
        <Box
          position="absolute"
          width="300px"
          height="1px"
          left="-10px"
          background={themeData.colors.bg.primary}
        />
        {uqbarContract ?
        <Flex
          position="absolute"
          bottom="-12px"
          height="25px"
          width="170px"
          justifyContent="center"
          alignItems="center"
          borderRadius="50px"
          background={
            theme.currentTheme.mode === 'light' ? '#EAF3FF' : '#262f3b'
          }
        >
          <Text variant="body" color={themeData.colors.brand.primary}>
            Contract Interaction
          </Text>
        </Flex>
          :
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
        } 
      </Flex>
    );

    return (
      <Box width="100%" hidden={props.hidden}>
        <Seperator />
        <TransactionPane
          onConfirm={props.onConfirm}
          max={
            props.coin
              ? Number(props.coin.balance)
              : Number(
                  (props.wallet as EthWalletType).data.get(walletApp.navState.protocol)!.balance
                )
          }
          onScreenChange={props.onScreenChange}
          uqbarContract={uqbarContract}
          close={props.close}
          coin={props.coin}
          setTransactionAmount={props.setTransactionAmount}
          transactionAmount={props.transactionAmount}
          setTransactionRecipient={props.setTransactionRecipient}
          transactionRecipient={props.transactionRecipient}
        />
      </Box>
    );
  }
);
