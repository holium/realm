import { observer } from 'mobx-react';
import { darken } from 'polished';
import { Flex, Icons, NoScrollBar, Text as OldText } from 'renderer/components';
import { Text } from '@holium/design-system';
import { Row } from 'renderer/components/NewRow';
import { toJS } from 'mobx';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/apps/store';
import {
  monthNames,
  formatEthAmount,
  formatBtcAmount,
  convertEthAmountToUsd,
  shortened,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  TransactionType,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';

export type TxType = 'coin' | 'nft' | 'general' | undefined;

interface TransactionProps {
  isCoin?: boolean;
  transaction: TransactionType;
}
export const Transaction = observer((props: TransactionProps) => {
  const { theme } = useServices();
  const { walletApp } = useTrayApps();
  const hoverBackground = darken(0.0325, theme.currentTheme.windowColor);
  const { transaction, isCoin } = props;
  const wasSent = transaction.type === 'sent';
  const isEth = transaction.network === 'ethereum';
  const themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  const completedDate = new Date(
    transaction.completedAt || transaction.initiatedAt || 0
  );

  const ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  const btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');

  const onClick = () => {
    console.log('clicked', toJS(transaction));
    WalletActions.navigate(WalletView.TRANSACTION_DETAIL, {
      detail: {
        type: 'transaction',
        txtype: (walletApp.navState.detail?.txtype as TxType) || 'general',
        coinKey: walletApp.navState.detail?.coinKey,
        key: transaction.hash,
      },
    });
  };

  return (
    <Row customBg={hoverBackground} onClick={onClick}>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" justifyContent="center">
          <Text.Custom fontWeight={500} fontSize={3}>
            {transaction.status !== 'pending'
              ? wasSent
                ? 'Sent'
                : 'Received'
              : wasSent
              ? 'Sending'
              : 'Receiving'}
          </Text.Custom>
          <Flex>
            <OldText
              variant="body"
              fontSize={1}
              color={
                transaction.status !== 'pending'
                  ? wasSent
                    ? 'text.error'
                    : 'text.success'
                  : 'brand.primary'
              }
            >
              {`${
                monthNames[completedDate.getMonth()]
              } ${completedDate.getDate()}`}
            </OldText>
            <OldText mx={1} variant="body" fontSize={1} color="text.disabled">
              ·
            </OldText>
            <Text.Custom
              truncate
              width={130}
              variant="body"
              fontSize={1}
              opacity={0.5}
            >
              {wasSent ? 'To:' : 'From:'} {themDisplay}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text.Body fontSize={2}>
            {transaction.type === 'sent' ? '-' : ''}{' '}
            {isEth ? `${ethAmount.eth}` /* ETH` */ : `${btcAmount.btc} BTC`}
          </Text.Body>
          {!isCoin && (
            <Text.Hint opacity={0.5}>
              {transaction.type === 'sent' ? '-' : ''}$
              {isEth &&
                `${convertEthAmountToUsd(
                  ethAmount,
                  walletApp.ethereum.conversions.usd
                )} USD`}
            </Text.Hint>
          )}
        </Flex>
      </Flex>
    </Row>
  );
});

interface TransactionListProps {
  height: number;
  transactions: TransactionType[];
  hidePending: boolean;
  ethType?: string;
}
export const TransactionList = observer((props: TransactionListProps) => {
  const { height = 230, ethType } = props;
  const { theme } = useServices();

  const pending = props.transactions.filter(
    (tx) => tx.status === 'pending'
  ).length;

  let transactions = props.transactions;
  if (ethType === 'ETH') {
    transactions = props.transactions.filter((tx) =>
      ethType ? tx.ethType === ethType : true
    );
  }

  return (
    <>
      <NoScrollBar
        width="100%"
        height={pending && !props.hidePending ? height - 54 : height}
        flexDirection="column"
        margin="auto"
        overflow="auto"
      >
        {transactions.length ? (
          transactions.map((transaction, index) => (
            <Transaction
              isCoin={ethType !== undefined}
              key={index}
              transaction={transaction}
            />
          ))
        ) : (
          <OldText
            mt={6}
            variant="h5"
            textAlign="center"
            color={theme.currentTheme.iconColor}
          >
            No transactions
          </OldText>
        )}
      </NoScrollBar>
      {transactions.length > 4 && (
        <Flex pt="2px" width="100%" justifyContent="center">
          <Icons
            name="ChevronDown"
            size={1}
            color={theme.currentTheme.iconColor}
          />
        </Flex>
      )}
    </>
  );
});
