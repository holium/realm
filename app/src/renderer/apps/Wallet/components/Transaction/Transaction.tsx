import { Flex, Row, Text } from '@holium/design-system/general';

import { TransactionType } from 'renderer/stores/models/wallet.model';

import {
  formatBtcAmount,
  formatEthAmount,
  monthNames,
  shortened,
} from '../../helpers';

type Props = {
  transaction: TransactionType;
  isCoin?: boolean;
  usdAmountDisplay?: string;
  onClick: () => void;
};

export const Transaction = ({
  transaction,
  isCoin,
  usdAmountDisplay,
  onClick,
}: Props) => {
  const wasSent = transaction.type === 'sent';
  const isEth = transaction.network === 'ethereum';
  const themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  const completedDate = new Date(
    transaction.completedAt || transaction.initiatedAt || 0
  );

  const ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  const btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');

  return (
    <Row onClick={onClick}>
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
            <Text.Body variant="body" fontSize={1}>
              {`${
                monthNames[completedDate.getMonth()]
              } ${completedDate.getDate()}`}
            </Text.Body>
            <Text.Body mx={1} variant="body" fontSize={1}>
              ·
            </Text.Body>
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
              {transaction.type === 'sent' ? '-' : ''}${usdAmountDisplay}
            </Text.Hint>
          )}
        </Flex>
      </Flex>
    </Row>
  );
};
