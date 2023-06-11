import { cite } from '@urbit/aura';

import { Flex, Row, Spinner, Text } from '@holium/design-system/general';

import { TransactionType } from 'renderer/stores/models/wallet.model';

import {
  convertBtcAmountToUsd,
  convertEthAmountToUsd,
  formatBtcAmount,
  formatEthAmount,
  monthNames,
  shortened,
} from '../../helpers';

type Props = {
  transaction: TransactionType;
  ethPrice: number | undefined;
  bitcoinPrice: number | undefined;
  isCoin?: boolean;
  onClick: () => void;
};

export const Transaction = ({
  transaction,
  ethPrice,
  bitcoinPrice,
  isCoin,
  onClick,
}: Props) => {
  const wasSent = transaction.type === 'sent';
  const isEth = transaction.network === 'ethereum';
  const themDisplay = transaction.theirPatp
    ? cite(transaction.theirPatp)
    : shortened(transaction.theirAddress);
  const date = new Date(
    transaction.completedAt ?? transaction.initiatedAt ?? '0'
  );

  const ethAmount =
    transaction.amount && transaction.amount !== 'NaN'
      ? formatEthAmount(isEth ? transaction.amount : '0')
      : ({ eth: '0' } as any);
  const btcAmount =
    transaction.amount && transaction.amount !== 'NaN'
      ? formatBtcAmount(!isEth ? transaction.amount : '0')
      : ({ btc: '0' } as any);
  const usdAmountDisplay = isEth
    ? convertEthAmountToUsd(ethAmount, ethPrice)
    : convertBtcAmountToUsd(btcAmount, bitcoinPrice);

  const currency = isEth ? 'ETH' : 'BTC';
  const statusMessage =
    transaction.status !== 'pending'
      ? wasSent
        ? `Sent ${currency}`
        : `Received ${currency}`
      : wasSent
      ? `Sending ${currency}`
      : `Receiving ${currency}`;

  const dateString = monthNames[date.getMonth()]
    ? `${monthNames[date.getMonth()]} ${date.getDate()}`
    : 'Sending...';

  return (
    <Row onClick={onClick}>
      <Flex width="100%" alignItems="center" gap="8px">
        <Flex flex={1} flexDirection="column" justifyContent="center">
          <Flex alignItems="center" gap={8}>
            <Text.Custom
              fontWeight={500}
              fontSize={3}
              opacity={transaction.status !== 'pending' ? 1 : 0.5}
            >
              {statusMessage}
            </Text.Custom>
            {transaction.status === 'pending' && <Spinner size={0} />}
          </Flex>
          <Flex gap="4px">
            <Text.Body
              fontSize={1}
              fontWeight={300}
              style={{
                whiteSpace: 'nowrap',
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
          <Text.Body
            fontSize={2}
            opacity={transaction.status !== 'pending' ? 1 : 0.5}
            color={
              transaction.status === 'pending'
                ? 'text'
                : wasSent
                ? 'intent-alert'
                : 'intent-success'
            }
          >
            {wasSent ? '-' : ''}
            {isEth ? `${ethAmount.eth} ETH` : `${btcAmount.btc} BTC`}
          </Text.Body>
          {!isCoin && <Text.Hint opacity={0.5}>${usdAmountDisplay}</Text.Hint>}
        </Flex>
      </Flex>
    </Row>
  );
};
