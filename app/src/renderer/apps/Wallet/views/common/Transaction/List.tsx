import { observer } from 'mobx-react';
import styled from 'styled-components';
import { darken } from 'polished';

import { Flex, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import {
  shortened,
  monthNames,
  formatEthAmount,
  formatBtcAmount,
  convertEthAmountToUsd,
  convertBtcAmountToUsd,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { TransactionType } from 'os/services/tray/wallet.model';
import { WalletView } from 'os/services/tray/wallet.model';

const NoScrollBar = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;
interface InputProps {
  hoverBg: string;
}
const DarkenOnHover = styled(Flex)<InputProps>`
  &:hover {
    background-color: ${(props) => props.hoverBg};
    border-radius: 4px;
  }
`;

interface TransactionProps {
  transaction: TransactionType;
}
export const Transaction = observer((props: TransactionProps) => {
  const { theme } = useServices();
  let hoverBackground = darken(0.04, theme.currentTheme.windowColor);

  const { transaction } = props;
  let wasSent = transaction.type === 'sent';
  let isEth = transaction.network === 'ethereum';
  let themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  let initiatedDate = new Date(transaction.initiatedAt!);

  let ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  let btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');

  let onClick = () => {
    WalletActions.setReturnView(WalletView.WALLET_DETAIL);
    WalletActions.setView(WalletView.TRANSACTION_DETAIL, undefined, {
      type: 'transaction',
      key: transaction.hash,
    });
  };

  return (
    <DarkenOnHover
      p={2}
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      hoverBg={hoverBackground}
      onClick={onClick}
    >
      <Flex flexDirection="column" justifyContent="center">
        <Text variant="h5" fontSize={3}>
          {wasSent ? 'Sent' : 'Received'}
        </Text>
        <Flex>
          <Text
            variant="body"
            fontSize={1}
            color={wasSent ? 'text.error' : 'text.success'}
          >
            {`${
              monthNames[initiatedDate.getMonth()]
            } ${initiatedDate.getDate()}`}
          </Text>
          <Text mx={1} variant="body" fontSize={1} color="text.disabled">
            ·
          </Text>
          <Text variant="body" fontSize={1} color="text.disabled">
            {wasSent ? 'To:' : 'From:'} {themDisplay}
          </Text>
        </Flex>
      </Flex>
      <Flex
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-end"
      >
        <Text variant="body" fontSize={2}>
          {transaction.type === 'sent' ? '-' : ''}{' '}
          {isEth ? `${ethAmount.eth}` /* ETH`*/ : `${btcAmount.btc} BTC`}
        </Text>
        <Text variant="body" fontSize={1} color="text.disabled">
          {transaction.type === 'sent' ? '-' : ''}$
          {isEth
            ? convertEthAmountToUsd(ethAmount)
            : convertBtcAmountToUsd(btcAmount)}{' '}
          USD
        </Text>
      </Flex>
    </DarkenOnHover>
  );
});

interface TransactionListProps {
  transactions: TransactionType[];
  hidePending: boolean;
  ethType?: string
}
export const TransactionList = observer((props: TransactionListProps) => {
  const { theme } = useServices();

  const pending = props.transactions
    .filter(
      (trans) => trans.status === 'pending'
    ).length;

  const transactions = props.transactions
    .filter(
      trans => props.ethType ? trans.ethType === props.ethType : true
    )

  return (
    <>
      <NoScrollBar
        width="100%"
        height={pending && !props.hidePending ? '175px' : '200px'}
        flexDirection="column"
        margin="auto"
        overflow="scroll"
      >
        {transactions.length ? (
          transactions.map((transaction, index) => (
            <Transaction key={index} transaction={transaction} />
          ))
        ) : (
          <Text
            mt={3}
            variant="h4"
            textAlign="center"
            color={theme.currentTheme.iconColor}
          >
            No transactions
          </Text>
        )}
      </NoScrollBar>
      {transactions.length > 3 && (
        <Flex pt={1} width="100%" justifyContent="center">
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
