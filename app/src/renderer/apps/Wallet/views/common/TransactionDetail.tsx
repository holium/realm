import { ChangeEvent, useState } from 'react';
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
  TextInput,
} from '@holium/design-system';
import { observer } from 'mobx-react';
import {
  BitcoinWalletType,
  EthWalletType,
  NetworkType,
  ProtocolType,
  TransactionType,
  WalletStoreType,
} from 'os/services/tray/wallet-lib/wallet.model';
import { useTrayApps } from 'renderer/apps/store';
import { Anchor } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { useServices } from 'renderer/logic/store';

import {
  convertBtcAmountToUsd,
  convertEthAmountToUsd,
  formatBtcAmount,
  formatEthAmount,
  getBaseTheme,
  getDisplayDate,
  shortened,
} from '../../lib/helpers';

const getTransaction = (walletApp: WalletStoreType): TransactionType | null => {
  const isEthereum = walletApp.navState.network === NetworkType.ETHEREUM;
  const isCoin = walletApp.navState.detail?.txtype === 'coin';
  const currentWallet = walletApp.currentWallet;

  if (!walletApp.navState.detail?.key) return null;

  if (isEthereum) {
    const walletData = (currentWallet as EthWalletType).data;
    if (isCoin) {
      if (!walletData) return null;

      const transactions = walletData
        .get(walletApp.navState.protocol)
        ?.coins?.get(walletApp.navState.detail?.coinKey ?? '')
        ?.transactionList.transactions;

      if (!transactions) return null;

      return transactions.get(walletApp.navState.detail.key) as TransactionType;
    } else {
      const transactions = walletData.get(walletApp.navState.protocol)
        ?.transactionList.transactions;

      if (!transactions) return null;

      return transactions.get(walletApp.navState.detail.key) as TransactionType;
    }
  }

  const bitcoinWallet = currentWallet as BitcoinWalletType;
  const transactions = bitcoinWallet.transactionList.transactions;

  if (!transactions) return null;

  return transactions.get(walletApp.navState.detail.key) as TransactionType;
};

const TransactionDetailPresenter = () => {
  const { walletApp } = useTrayApps();

  let transaction = getTransaction(walletApp);

  const { theme } = useServices();
  const themeData = getBaseTheme(theme.currentTheme);

  const [notes, setNotes] = useState(transaction?.notes ?? '');
  const [loading, setLoading] = useState(false);

  const saveNotes = () => {
    setLoading(true);
    WalletActions.saveTransactionNotes(notes).then(() => {
      setLoading(false);
    });
  };

  if (!transaction) return null;

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
    <Flex width="100%" height="100%" flexDirection="column" py={1}>
      <Text.Custom fontSize={2} color={themeData.colors.text.disabled}>
        Transaction
      </Text.Custom>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        {transaction.status === 'pending' ? (
          <Flex alignItems="center">
            <Text.Custom
              opacity={0.9}
              fontWeight={600}
              fontSize={7}
              animate={false}
            >
              Pending
            </Text.Custom>
            <Spinner
              ml={3}
              mt={1}
              size={0}
              color={themeData.colors.text.primary}
            />
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
          <Text.Custom
            fontSize={4}
            color={
              wasSent
                ? themeData.colors.text.error
                : themeData.colors.text.success
            }
          >
            {wasSent && '-'} {amountDisplay}
          </Text.Custom>
          {walletApp.navState.protocol === ProtocolType.ETH_MAIN && (
            <Text.Custom fontSize={2} color={themeData.colors.text.secondary}>
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
            </Text.Custom>
          )}
        </Flex>
      </Flex>
      <Flex mt={8} width="100%" justifyContent="space-between">
        <Text.Custom
          fontSize={1}
          opacity={0.7}
          color={themeData.colors.text.secondary}
        >
          {wasSent ? 'SENT TO' : 'RECEIVED FROM'}
        </Text.Custom>
        <Flex alignItems="center">
          {!transaction.theirPatp ? (
            <Icon name="Spy" size={18} opacity={0.5} />
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
          <Text.Custom fontSize={1} ml={2}>
            {themDisplay}
          </Text.Custom>
        </Flex>
      </Flex>
      <Flex
        position="relative"
        mt={4}
        width="100%"
        justifyContent="space-between"
      >
        <Text.Custom
          fontSize={1}
          opacity={0.7}
          color={themeData.colors.text.secondary}
        >
          DATE
        </Text.Custom>
        <Text.Custom fontSize={1}>{getDisplayDate(completed)}</Text.Custom>
      </Flex>
      <Flex
        position="relative"
        mt={4}
        width="100%"
        justifyContent="space-between"
      >
        <Text.Custom
          fontSize={1}
          opacity={0.7}
          color={themeData.colors.text.secondary}
        >
          HASH
        </Text.Custom>
        <Flex position="relative" left="10px">
          <Anchor
            fontSize={1}
            color={themeData.colors.text.primary}
            href={`https://goerli.etherscan.io/tx/${transaction.hash}`}
          >
            {transaction.hash.slice(0, 12)}...{' '}
            <Icon mb={1} name="Link" size={16} opacity={0.5} />
          </Anchor>
        </Flex>
      </Flex>
      <Flex flexDirection="column" mt={8}>
        <Text.Label style={{ marginBottom: 4 }} opacity={0.7} fontSize={1}>
          Notes
        </Text.Label>
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
            <Button.Primary
              width="100%"
              height={32}
              justifyContent="center"
              disabled={notes === transaction.notes && !loading}
              onClick={saveNotes}
            >
              {loading ? <Spinner size={0} color="white" /> : 'Save notes'}
            </Button.Primary>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const TransactionDetail = observer(TransactionDetailPresenter);
