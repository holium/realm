import { observer } from 'mobx-react';

import { Box, Flex, Text } from '@holium/design-system/general';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { TransactionPane } from './Pane';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

type Props = {
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
};

export const SendTransactionPresenter = ({
  coin,
  hidden,
  onScreenChange,
  close,
  wallet,
  onConfirm,
  transactionAmount,
  setTransactionAmount,
  transactionRecipient,
  setTransactionRecipient,
}: Props) => {
  const { walletStore } = useShipStore();
  const pendingTx =
    walletStore.navState.protocol === ProtocolType.UQBAR
      ? walletStore.uqTx
      : null;
  const uqbarContract: boolean = pendingTx ? 'noun' in pendingTx.action : false;

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
    <Box width="100%" hidden={hidden} color="card">
      <Flex flexDirection="column" gap={10}>
        <Separator />
        <TransactionPane
          onConfirm={onConfirm}
          max={
            coin
              ? Number(coin.balance)
              : Number(
                  (wallet as EthWalletType).data.get(
                    walletStore.navState.protocol
                  )?.balance
                )
          }
          onScreenChange={onScreenChange}
          uqbarContract={uqbarContract}
          close={close}
          coin={coin}
          setTransactionAmount={setTransactionAmount}
          transactionAmount={transactionAmount}
          setTransactionRecipient={setTransactionRecipient}
          transactionRecipient={transactionRecipient}
        />
      </Flex>
    </Box>
  );
};

export const SendTransaction = observer(SendTransactionPresenter);
