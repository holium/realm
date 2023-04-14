import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Box, Text } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import {
  BitcoinWalletType,
  EthWalletType,
  ERC20Type,
  ProtocolType,
} from 'os/services/tray/wallet-lib/wallet.model';
import { TransactionPane } from './Pane';
import { useShipStore } from 'renderer/stores/ship.store';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

interface SendTransactionProps {
  hidden: boolean;
  onScreenChange: any;
  close: () => void;
  wallet: EthWalletType | BitcoinWalletType;
  coin: ERC20Type | null;
  onConfirm: () => void;
  transactionAmount: any;
  setTransactionAmount: any;
  transactionRecipient: any;
  setTransactionRecipient: any;
}

export const SendTransaction: FC<SendTransactionProps> = observer(
  (props: SendTransactionProps) => {
    const { coin } = props;
    const { theme } = useServices();
    const { walletStore } = useShipStore();
    const pendingTx =
      walletStore.navState.protocol === ProtocolType.UQBAR
        ? walletStore.uqTx
        : null;
    const uqbarContract: boolean = pendingTx
      ? 'noun' in pendingTx.action
      : false;

    const Seperator = () => (
      <Flex mt={6} position="relative" width="100%" justifyContent="center">
        <Box position="absolute" width="300px" height="1px" left="-10px" />
        {uqbarContract ? (
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
            <Text.Body color="accent">Contract Interaction</Text.Body>
          </Flex>
        ) : (
          <Flex
            position="absolute"
            px={2}
            bottom="-12px"
            height="25px"
            min-width="80px"
            justifyContent="center"
            alignItems="center"
            borderRadius="50px"
            background={
              theme.currentTheme.mode === 'light' ? '#EAF3FF' : '#262f3b'
            }
          >
            <Text.Body color="accent">
              {`Send ${
                coin
                  ? coin.name
                  : walletStore.navState.protocol === ProtocolType.UQBAR
                  ? 'zigs'
                  : abbrMap[
                      walletStore.navState.network as 'bitcoin' | 'ethereum'
                    ]
              }
              `}
            </Text.Body>
          </Flex>
        )}
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
                  (props.wallet as EthWalletType).data.get(
                    walletStore.navState.protocol
                  )?.balance
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
