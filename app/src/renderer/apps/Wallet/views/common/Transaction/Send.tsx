import { FC } from 'react';
import { Box, Flex, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
  ProtocolType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

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
    const { walletStore } = useShipStore();
    const pendingTx =
      walletStore.navState.protocol === ProtocolType.UQBAR
        ? walletStore.uqTx
        : null;
    const uqbarContract: boolean = pendingTx
      ? 'noun' in pendingTx.action
      : false;

    const Separator = () => (
      <Flex position="relative" width="100%" justifyContent="center" gap={10}>
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
          >
            <Text.Body color="accent">Contract Interaction</Text.Body>
          </Flex>
        ) : (
          <Flex
            position="absolute"
            px={2}
            bottom="-12px"
            // height="25px"
            min-width="80px"
            justifyContent="center"
            alignItems="center"
            borderRadius="50px"
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
      <Box width="100%" hidden={props.hidden} color="card">
        <Flex flexDirection="column" gap={10}>
          <Separator />
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
        </Flex>
      </Box>
    );
  }
);
