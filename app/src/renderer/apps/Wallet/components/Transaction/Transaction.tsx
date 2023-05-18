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
  usdAmountDisplay: string;
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

  const currency = isEth ? 'ETH' : 'BTC';
  const statusMessage =
    transaction.status !== 'pending'
      ? wasSent
        ? `Sent ${currency}`
        : `Received ${currency}`
      : wasSent
      ? `Sending ${currency}`
      : `Receiving ${currency}`;

  const dateString = `${
    monthNames[completedDate.getMonth()]
  } ${completedDate.getDate()}`;

  return (
    <Row onClick={onClick}>
      <Flex width="100%" alignItems="center" gap="8px">
        <Flex flex={1} flexDirection="column" justifyContent="center">
          <Text.Custom fontWeight={500} fontSize={3}>
            {statusMessage}
          </Text.Custom>
          <Flex gap="4px">
            <Text.Body
              fontSize={1}
              fontWeight={300}
              opacity={wasSent ? 1 : 0.5}
              style={{
                whiteSpace: 'nowrap',
                color: wasSent
                  ? 'var(--rlm-intent-success-color)'
                  : 'var(--rlm-text-color)',
              }}
            >
              {dateString}
            </Text.Body>
            <Text.Body
              fontSize={1}
              fontWeight={300}
              opacity={0.5}
              style={{ whiteSpace: 'nowrap' }}
            >
              ·
            </Text.Body>
            <Text.Custom
              truncate
              fontSize={1}
              fontWeight={300}
              opacity={0.5}
              style={{ whiteSpace: 'nowrap' }}
            >
              {`${wasSent ? 'To:' : 'From:'} ${themDisplay}`}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          alignItems="flex-end"
          justifyContent="center"
        >
          <Text.Body fontSize={2}>
            {isEth ? `-${ethAmount.eth} ETH` : `-${btcAmount.btc} BTC`}
          </Text.Body>
          {!isCoin && <Text.Hint opacity={0.5}>-${usdAmountDisplay}</Text.Hint>}
        </Flex>
      </Flex>
    </Row>
  );
};
