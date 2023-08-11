import { ChangeEvent, useState } from 'react';

import {
  Anchor,
  Avatar,
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

import {
  WalletCardBody,
  WalletCardStyle,
} from '../../../components/WalletCardWrapper';

type Props = {
  wasSent: boolean;
  transactionStatus: string;
  amountDisplay: string;
  usdAmount: string | number;
  themDisplay: string;
  patp: string | null;
  protocol: ProtocolType;
  completedAtString: string;
  transactionNotes: string;
  transactionHash: string;
  saveTransactionNotes: (notes: string) => Promise<void>;
};

export const TransactionDetailScreenBody = ({
  wasSent,
  transactionStatus,
  amountDisplay,
  usdAmount,
  themDisplay,
  patp,
  protocol,
  completedAtString,
  transactionNotes,
  transactionHash,
  saveTransactionNotes,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(transactionNotes ?? '');

  const onClickSaveNotes = () => {
    setLoading(true);
    saveTransactionNotes(notes).then(() => setLoading(false));
  };

  const statusMessage =
    transactionStatus !== 'pending'
      ? wasSent
        ? 'SENT TO'
        : 'RECEIVED FROM'
      : wasSent
      ? 'SENDING TO'
      : 'RECEIVING FROM';

  return (
    <WalletCardStyle isSelected>
      <WalletCardBody>
        <Text.Body fontSize={2} opacity={0.5}>
          Transaction
        </Text.Body>
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          {transactionStatus === 'pending' ? (
            <Flex alignItems="center" gap={8}>
              <Text.Body
                opacity={0.5}
                fontWeight={600}
                fontSize={7}
                animate={false}
              >
                {wasSent ? 'Sending' : 'Receiving'}
              </Text.Body>
              <Spinner size={0} />
            </Flex>
          ) : (
            <Text.H1
              opacity={0.9}
              fontWeight={600}
              fontSize={7}
              animate={false}
            >
              {wasSent ? `Sent` : `Received`}
            </Text.H1>
          )}
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-end"
          >
            <Text.Body
              fontSize={4}
              opacity={transactionStatus !== 'pending' ? 1 : 0.5}
              color={
                transactionStatus === 'pending'
                  ? 'text'
                  : wasSent
                  ? 'intent-alert'
                  : 'intent-success'
              }
            >
              {wasSent && '-'} {amountDisplay}
            </Text.Body>
            {protocol === ProtocolType.ETH_MAIN && (
              <Text.Body fontSize={2}>${usdAmount} USD</Text.Body>
            )}
          </Flex>
        </Flex>
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text.Body fontSize={1} opacity={0.7}>
            {statusMessage}
          </Text.Body>
          <Flex alignItems="center">
            {!patp ? (
              <Icon name="Spy" size={18} opacity={0.5} />
            ) : (
              <Avatar
                simple={true}
                size={20}
                patp={patp}
                sigilColor={['#000000', 'white']}
              />
            )}
            <Text.Body fontSize={1} ml={2}>
              {themDisplay}
            </Text.Body>
          </Flex>
        </Flex>
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text.Body fontSize={1} opacity={0.7}>
            DATE
          </Text.Body>
          <Text.Body fontSize={1}>{completedAtString}</Text.Body>
        </Flex>
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text.Body fontSize={1} opacity={0.7}>
            HASH
          </Text.Body>
          <Flex>
            <Anchor
              href={`https://goerli.etherscan.io/tx/${transactionHash}`}
              rel="noreferrer"
              target="_blank"
              style={{
                fontSize: '12px',
              }}
            >
              {transactionHash.slice(0, 12)}...{' '}
              <Icon mb={1} name="Link" size={16} opacity={0.5} />
            </Anchor>
          </Flex>
        </Flex>
        <Flex flexDirection="column" gap="4px">
          <Text.Label opacity={0.7} fontSize={1}>
            Notes
          </Text.Label>
          <TextInput
            id="transaction-notes"
            name="transaction-notes"
            type="textarea"
            rows={4}
            cols={50}
            value={notes}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNotes(e.target.value)
            }
            placeholder="Transaction notes..."
          />
          <Flex width="100%" justifyContent="flex-end">
            <Button.Primary
              height={32}
              justifyContent="center"
              isDisabled={notes === transactionNotes && !loading}
              onClick={onClickSaveNotes}
            >
              {loading ? <Spinner size={0} color="white" /> : 'Save'}
            </Button.Primary>
          </Flex>
        </Flex>
      </WalletCardBody>
    </WalletCardStyle>
  );
};
