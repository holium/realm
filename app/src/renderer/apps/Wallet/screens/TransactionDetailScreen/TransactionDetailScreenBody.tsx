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

  return (
    <Flex width="100%" height="100%" flexDirection="column" gap={10}>
      <Text.Custom fontSize={2}>Transaction</Text.Custom>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        {transactionStatus === 'pending' ? (
          <Flex alignItems="center">
            <Text.Custom
              opacity={0.9}
              fontWeight={600}
              fontSize={7}
              animate={false}
            >
              Pending
            </Text.Custom>
            <Spinner size={0} />
          </Flex>
        ) : (
          <Text.Custom
            opacity={0.9}
            fontWeight={600}
            fontSize={7}
            animate={false}
          >
            {wasSent ? `Sent` : `Received`}
          </Text.Custom>
        )}
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text.Custom fontSize={4}>
            {wasSent && '-'} {amountDisplay}
          </Text.Custom>
          {protocol === ProtocolType.ETH_MAIN && (
            <Text.Custom fontSize={2}>${usdAmount}</Text.Custom>
          )}
        </Flex>
      </Flex>
      <Flex width="100%" justifyContent="space-between">
        <Text.Custom fontSize={1} opacity={0.7}>
          {wasSent ? 'SENT TO' : 'RECEIVED FROM'}
        </Text.Custom>
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
          <Text.Custom fontSize={1} ml={2}>
            {themDisplay}
          </Text.Custom>
        </Flex>
      </Flex>
      <Flex position="relative" width="100%" justifyContent="space-between">
        <Text.Custom fontSize={1} opacity={0.7}>
          DATE
        </Text.Custom>
        <Text.Custom fontSize={1}>{completedAtString}</Text.Custom>
      </Flex>
      <Flex position="relative" width="100%" justifyContent="space-between">
        <Text.Custom fontSize={1} opacity={0.7}>
          HASH
        </Text.Custom>
        <Flex position="relative" left="10px">
          <Anchor
            href={`https://goerli.etherscan.io/tx/${transactionHash}`}
            rel="noreferrer"
            target="_blank"
          >
            {transactionHash.slice(0, 12)}...{' '}
            <Icon mb={1} name="Link" size={16} opacity={0.5} />
          </Anchor>
        </Flex>
      </Flex>
      <Flex flexDirection="column" gap={10}>
        <Text.Label style={{ marginBottom: 4 }} opacity={0.7} fontSize={1}>
          Notes
        </Text.Label>
        <Flex
          width="100%"
          flexDirection="column"
          justifyContent="center"
          gap={10}
        >
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
          <Button.Primary
            width="100%"
            height={32}
            justifyContent="center"
            disabled={notes === transactionNotes && !loading}
            onClick={onClickSaveNotes}
          >
            {loading ? <Spinner size={0} color="white" /> : 'Save notes'}
          </Button.Primary>
        </Flex>
      </Flex>
    </Flex>
  );
};
