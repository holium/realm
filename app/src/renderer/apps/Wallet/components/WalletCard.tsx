import { useMemo } from 'react';

import { Flex, Text } from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  formatEthAmount,
  formatZigAmount,
  getCoins,
  getMockCoinIcon,
  getTransactions,
} from '../helpers';
import {
  WalletCardStyle,
  walletCardStyleTransition,
} from './WalletCardWrapper';

type Props = {
  walletKey: string;
  isSelected?: boolean;
  onSelect?: () => void;
};

export const WalletCard = ({
  walletKey,
  isSelected = false,
  onSelect,
}: Props) => {
  const { walletStore } = useShipStore();

  const wallet = walletStore.currentStore.wallets.get(walletKey);

  let coins: any = null;
  if (walletStore.navState.network === NetworkType.ETHEREUM) {
    const ethWallet = wallet as EthWalletType;
    const coinMap = ethWallet.data.get(walletStore.navState.protocol)?.coins;
    if (coinMap) coins = getCoins(coinMap as any);
  }

  const walletTransactions =
    walletStore.navState.network === NetworkType.ETHEREUM
      ? (wallet as EthWalletType).data.get(walletStore.navState.protocol)
          ?.transactionList.transactions
      : (wallet as BitcoinWalletType).transactionList.transactions;

  const transactions = getTransactions(walletTransactions || new Map());

  const amountDisplay =
    walletStore.navState.network === NetworkType.ETHEREUM
      ? walletStore.navState.protocol === ProtocolType.UQBAR
        ? `${formatZigAmount(
            (wallet as EthWalletType).data.get(walletStore.navState.protocol)
              ?.balance ?? ''
          )} zigs`
        : `${
            formatEthAmount(
              (wallet as EthWalletType).data.get(walletStore.navState.protocol)
                ?.balance ?? ''
            ).eth
          } ETH`
      : `${formatEthAmount((wallet as BitcoinWalletType).balance).eth} BTC`;

  return useMemo(
    () => (
      <WalletCardStyle
        layout="size"
        layoutId={`wallet-card-${wallet?.address}`}
        justifyContent="flex-start"
        transition={walletCardStyleTransition}
        isSelected={!!isSelected}
        onClick={onSelect}
      >
        <Text.Body
          layoutId={`wallet-name-${wallet?.address}`}
          layout="position"
          transition={{ duration: 0.1 }}
          fontWeight={600}
          style={{ textTransform: 'uppercase' }}
        >
          {wallet?.nickname}
        </Text.Body>
        <Text.Body
          mt={1}
          layoutId={`wallet-balance-${wallet?.address}`}
          transition={{ duration: 0.1 }}
          fontWeight={600}
          fontSize={7}
        >
          {amountDisplay}
        </Text.Body>
        <Flex
          // layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          pt={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex>
            {coins?.slice(0, 6).map((coin: ERC20Type, index: number) => (
              <img
                alt={coin.name}
                src={coin.logo || getMockCoinIcon(coin.name)}
                style={{ height: '14px', marginRight: '4px' }}
                key={index}
              />
            ))}
            {coins && coins.length > 6 && (
              <Text.Body ml={1} variant="body">
                +{coins.length - 6}
              </Text.Body>
            )}
          </Flex>
          <Text.Body variant="body">
            {transactions.length} Transactions
          </Text.Body>
        </Flex>
      </WalletCardStyle>
    ),
    [wallet, isSelected, coins, transactions.length]
  );
};
