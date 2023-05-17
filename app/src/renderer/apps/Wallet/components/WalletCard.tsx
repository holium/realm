import { Flex, Text } from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
  TransactionType,
} from 'renderer/stores/models/wallet.model';

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
  wallet: BitcoinWalletType | EthWalletType;
  network: NetworkType;
  protocol: ProtocolType;
  isSelected?: boolean;
  onSelect?: () => void;
};

export const WalletCard = ({
  wallet,
  network,
  protocol,
  isSelected = false,
  onSelect,
}: Props) => {
  let coins: ERC20Type[] | null = null;
  let transactions: TransactionType[] | null = null;

  if (network === NetworkType.ETHEREUM) {
    const ethWallet = wallet as EthWalletType;
    if (!ethWallet.data) return null;

    const coinMap = ethWallet.data.get(protocol)?.coins;
    if (coinMap) coins = getCoins(coinMap as any);
  }

  if (network === NetworkType.ETHEREUM) {
    const ethWallet = wallet as EthWalletType;
    if (!ethWallet.data) return null;

    transactions = getTransactions(
      ethWallet.data.get(protocol)?.transactionList.transactions ?? new Map()
    );
  } else {
    const btcWallet = wallet as BitcoinWalletType;

    transactions = getTransactions(btcWallet.transactionList.transactions);
  }

  const amountDisplay =
    network === NetworkType.ETHEREUM
      ? protocol === ProtocolType.UQBAR
        ? `${formatZigAmount(
            (wallet as EthWalletType).data.get(protocol)?.balance ?? ''
          )} zigs`
        : `${
            formatEthAmount(
              (wallet as EthWalletType).data.get(protocol)?.balance ?? ''
            ).eth
          } ETH`
      : `${
          formatEthAmount((wallet as BitcoinWalletType).balance)?.eth ?? ''
        } BTC`;

  return (
    <WalletCardStyle
      layout="size"
      layoutId={`wallet-card-${wallet?.address}`}
      justifyContent="flex-start"
      transition={walletCardStyleTransition}
      isSelected={!!isSelected}
      onClick={onSelect}
    >
      <Text.Body
        opacity={0.5}
        fontWeight={600}
        style={{ textTransform: 'uppercase' }}
      >
        {wallet?.nickname}
      </Text.Body>
      <Text.Body mt={1} fontWeight={600} fontSize={7}>
        {amountDisplay}
      </Text.Body>
      <Flex
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
        <Text.Body opacity={0.3}>{transactions?.length} Transactions</Text.Body>
      </Flex>
    </WalletCardStyle>
  );
};
