import { useState, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import {
  Flex,
  Text,
  Button,
  Icons,
  Sigil,
  Anchor,
  Spinner,
} from 'renderer/components';
import { Avatar, TextInput } from '@holium/design-system';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import {
  shortened,
  getBaseTheme,
  formatEthAmount,
  formatBtcAmount,
  convertEthAmountToUsd,
  convertBtcAmountToUsd,
  getDisplayDate,
} from '../../lib/helpers';
import {
  NetworkType,
  EthWalletType,
  BitcoinWalletType,
  TransactionType,
  ProtocolType,
} from 'os/services/tray/wallet-lib/wallet.model';
import { WalletActions } from 'renderer/logic/actions/wallet';

const TransactionDetailPresenter = () => {
  const { walletApp } = useTrayApps();
  const transactionList =
    walletApp.navState.network === NetworkType.ETHEREUM
      ? walletApp.navState.detail?.txtype &&
        walletApp.navState.detail!.txtype === 'coin'
        ? (walletApp.currentWallet! as EthWalletType).data
            .get(walletApp.navState.protocol)!
            .coins.get(walletApp.navState.detail!.coinKey!)!.transactionList
            .transactions
        : (walletApp.currentWallet! as EthWalletType).data.get(
            walletApp.navState.protocol
          )!.transactionList.transactions
      : (walletApp.currentWallet! as BitcoinWalletType).transactionList
          .transactions;
  const transaction = transactionList.get(
    walletApp.navState.detail!.key
  )! as TransactionType;

  const { theme } = useServices();
  const themeData = getBaseTheme(theme.currentTheme);

  const [notes, setNotes] = useState(transaction.notes);
  const [loading, setLoading] = useState(false);

  const saveNotes = () => {
    setLoading(true);
    WalletActions.saveTransactionNotes(notes).then(() => {
      setLoading(false);
    });
  };

  const wasSent = transaction.type === 'sent';
  const isEth = transaction.network === 'ethereum';
  const themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  const completed = new Date(
    transaction.completedAt || transaction.initiatedAt || ''
  );

  const ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  const btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');
  const amountDisplay = isEth
    ? `${ethAmount.eth}` /* ETH` */
    : `${btcAmount.btc} BTC`;

  return (
    <Flex width="100%" height="100%" flexDirection="column" py={1} px={4}>
      <Text fontSize={2} color={themeData.colors.text.disabled}>
        Transaction
      </Text>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        {transaction.status === 'pending' ? (
          <Flex alignItems="center">
            <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
              Pending
            </Text>
            <Spinner
              ml={3}
              mt={1}
              size={0}
              color={themeData.colors.text.primary}
            />
          </Flex>
        ) : (
          <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
            {wasSent ? `Sent` : `Received`}
          </Text>
        )}
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text
            variant="body"
            fontSize={4}
            color={
              wasSent
                ? themeData.colors.text.error
                : themeData.colors.text.success
            }
          >
            {wasSent && '-'} {amountDisplay}
          </Text>
          {walletApp.navState.protocol === ProtocolType.ETH_MAIN && (
            <Text
              variant="body"
              fontSize={2}
              color={themeData.colors.text.secondary}
            >
              $
              {isEth
                ? convertEthAmountToUsd(
                    ethAmount,
                    walletApp.ethereum.conversions.usd
                  )
                : convertBtcAmountToUsd(
                    btcAmount,
                    walletApp.bitcoin.conversions.usd
                  )}
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex mt={8} width="100%" justifyContent="space-between">
        <Text
          variant="body"
          fontSize={1}
          color={themeData.colors.text.secondary}
        >
          {wasSent ? 'SENT TO' : 'RECEIVED FROM'}
        </Text>
        <Flex alignItems="center">
          {!transaction.theirPatp ? (
            <Icons
              name="Spy"
              size="20px"
              color={themeData.colors.text.secondary}
            />
          ) : (
            <Avatar
              sigilColor={
                theme.currentTheme.mode === 'light'
                  ? ['black', 'white']
                  : ['white', 'black']
              }
              simple={true}
              size={20}
              patp={transaction.theirPatp}
            />
          )}
          <Text variant="body" fontSize={1} ml={2}>
            {themDisplay}
          </Text>
        </Flex>
      </Flex>
      <Flex
        position="relative"
        mt={4}
        width="100%"
        justifyContent="space-between"
      >
        <Text
          variant="body"
          fontSize={1}
          color={themeData.colors.text.secondary}
        >
          DATE
        </Text>
        <Text variant="body" fontSize={1}>
          {getDisplayDate(completed)}
        </Text>
      </Flex>
      <Flex
        position="relative"
        mt={4}
        width="100%"
        justifyContent="space-between"
      >
        <Text
          variant="body"
          fontSize={1}
          color={themeData.colors.text.secondary}
        >
          HASH
        </Text>
        <Flex position="relative" left="10px">
          <Anchor
            fontSize={1}
            color={themeData.colors.text.primary}
            href={`https://goerli.etherscan.io/tx/${transaction.hash}`}
          >
            {transaction.hash.slice(0, 12)}...{' '}
            <Icons mb={1} name="Link" size={1} />
          </Anchor>
        </Flex>
      </Flex>
      <Text
        mt={8}
        mb={2}
        ml={1}
        variant="label"
        color={themeData.colors.text.secondary}
        fontSize={1}
      >
        Notes
      </Text>
      <Flex width="100%" flexDirection="column" justifyContent="center">
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
        <Flex mt={4} width="100%" justifyContent="flex-end">
          <Button
            width="100%"
            disabled={notes === transaction.notes}
            isLoading={loading}
            onClick={saveNotes}
          >
            Save notes
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const TransactionDetail = observer(TransactionDetailPresenter);
