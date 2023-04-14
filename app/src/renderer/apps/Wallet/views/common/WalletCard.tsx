import { FC, useMemo } from 'react';
import { Text, Flex } from '@holium/design-system';
import { useTrayApps } from 'renderer/apps/store';
import {
  formatEthAmount,
  formatZigAmount,
  getCoins,
  getMockCoinIcon,
  getTransactions,
} from '../../lib/helpers';
import {
  EthWalletType,
  BitcoinWalletType,
  NetworkType,
  ProtocolType,
  ERC20Type,
} from 'os/services/tray/wallet-lib/wallet.model';
import {
  WalletCardStyle,
  walletCardStyleTransition,
} from '../../components/WalletCardWrapper';

interface WalletCardProps {
  // wallet: EthWalletType | BitcoinWalletType;
  walletKey: any;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const WalletCard: FC<WalletCardProps> = ({
  walletKey,
  isSelected,
  onSelect,
}: WalletCardProps) => {
  const { walletApp } = useTrayApps();

  const wallet = walletApp.currentStore.wallets.get(walletKey);

  let coins: any = null;
  if (walletApp.navState.network === NetworkType.ETHEREUM) {
    const ethWallet = wallet as EthWalletType;
    const coinMap = ethWallet.data.get(walletApp.navState.protocol)?.coins;
    if (coinMap) coins = getCoins(coinMap);
  }

  const walletTransactions =
    walletApp.navState.network === NetworkType.ETHEREUM
      ? (wallet as EthWalletType).data.get(walletApp.navState.protocol)
          ?.transactionList.transactions
      : (wallet as BitcoinWalletType).transactionList.transactions;

  const transactions = getTransactions(walletTransactions || new Map());

  const amountDisplay =
    walletApp.navState.network === NetworkType.ETHEREUM
      ? walletApp.navState.protocol === ProtocolType.UQBAR
        ? `${formatZigAmount(
            (wallet as EthWalletType).data.get(walletApp.navState.protocol)
              ?.balance ?? ''
          )} zigs`
        : `${
            formatEthAmount(
              (wallet as EthWalletType).data.get(walletApp.navState.protocol)
                ?.balance ?? ''
            ).eth
          } ETH`
      : `${formatEthAmount((wallet as BitcoinWalletType).balance).eth} BTC`;

  return useMemo(
    () => (
      <WalletCardStyle
        layout="size"
        elevation="none"
        layoutId={`wallet-card-${wallet?.address}`}
        justifyContent="flex-start"
        transition={walletCardStyleTransition}
        mode={mode}
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
            {coins &&
              coins
                .slice(0, 6)
                .map((coin: ERC20Type, index: number) => (
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
          <Text.Body variant="body" color={theme.currentTheme.iconColor}>
            {transactions.length} Transactions
          </Text.Body>
        </Flex>
      </WalletCardStyle>
    ),
    [wallet, isSelected, theme, mode, coins, transactions.length]
  );
};

WalletCard.defaultProps = {
  isSelected: false,
};
