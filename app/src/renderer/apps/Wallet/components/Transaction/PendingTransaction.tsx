import { observer } from 'mobx-react';

import {
  Button,
  Card,
  Flex,
  Icon,
  Spinner,
  Text,
} from '@holium/design-system/general';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';
import { WalletScreen } from 'renderer/apps/Wallet/types';
import { TransactionType } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { formatBtcAmount, formatEthAmount, shortened } from '../../helpers';

type Props = {
  transaction: TransactionType;
  hide: () => void;
};

const PendingTransactionPresenter = ({ transaction, hide }: Props) => {
  const { walletStore } = useShipStore();

  const goToTransaction = () => {
    walletStore.navigate(WalletScreen.TRANSACTION_DETAIL, {
      walletIndex: transaction.walletIndex.toString(),
      detail: {
        type: 'transaction',
        txtype: transaction.ethType ? 'coin' : 'general',
        coinKey: transaction.ethType,
        key: transaction.hash,
      },
    });
  };

  const isEth = transaction.network === 'ethereum';
  const ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  const btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');
  const themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  let unitsDisplay = 'BTC';
  if (isEth) {
    unitsDisplay =
      transaction.ethType === 'ETH'
        ? walletStore.navState.protocol === ProtocolType.UQBAR
          ? 'zigs'
          : 'ETH'
        : walletStore.ethereum.wallets
            ?.get(transaction.walletIndex.toString())
            ?.data.get(walletStore.navState.protocol)
            ?.coins.get(transaction.ethType)?.name ?? '';
  }

  return (
    <Card width="100%" style={{ borderRadius: '9px' }}>
      <Flex flexDirection="row" justifyContent="space-between">
        <Flex
          justifyContent="center"
          alignItems="center"
          onClick={goToTransaction}
          gap={10}
          padding={1}
        >
          <Flex height="100%" alignItems="center" ml={1}>
            <Spinner size={0} />
          </Flex>
          <Flex flexDirection="column">
            <Text.Body variant="body">
              {transaction.type === 'sent' ? 'Sending' : 'Receiving'}{' '}
              {isEth ? ethAmount.eth : btcAmount.btc} {unitsDisplay}
            </Text.Body>
            <Text.Body variant="body" fontSize={1}>
              {transaction.type === 'sent' ? 'To:' : 'From:'} {themDisplay}{' '}
              <Icon ml="7px" name="ShareBox" size="15px" />
            </Text.Body>
          </Flex>
        </Flex>
        <Flex justifyContent="center" alignItems="center">
          <Button.IconButton onClick={hide} mr={1}>
            <Icon opacity={0.7} name="Close" size="15px" />
          </Button.IconButton>
        </Flex>
      </Flex>
    </Card>
  );
};

export const PendingTransaction = observer(PendingTransactionPresenter);
