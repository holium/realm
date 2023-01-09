import { FC, useMemo } from 'react';
import { darken, lighten, rgba } from 'polished';
import { Text, Flex } from 'renderer/components';
import { ThemeType } from 'renderer/theme';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/apps/store';
import {
  formatEthAmount,
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
  wallet: EthWalletType | BitcoinWalletType;
  isSelected?: boolean;
  onSelect?: () => void;
  theme?: ThemeType;
}

export const WalletCard: FC<WalletCardProps> = ({
  wallet,
  isSelected,
  onSelect,
}: WalletCardProps) => {
  const { theme } = useServices();
  const { walletApp } = useTrayApps();
  const mode = theme.currentTheme.mode === 'light' ? 'light' : 'dark';

  let coins: any = null;
  if (walletApp.navState.network === NetworkType.ETHEREUM) {
    coins = getCoins(
      (wallet as EthWalletType).data.get(walletApp.navState.protocol)!.coins
    );
  }

  const walletTransactions =
    walletApp.navState.network === NetworkType.ETHEREUM
      ? (wallet as EthWalletType).data.get(walletApp.navState.protocol)!
          .transactionList.transactions
      : (wallet as BitcoinWalletType).transactionList.transactions;

  const transactions = getTransactions(walletTransactions || new Map());

  const ethTicker =
    walletApp.navState.protocol === ProtocolType.UQBAR ? ' zigs' : ' ETH';
  const amountDisplay =
    walletApp.navState.network === NetworkType.ETHEREUM
      ? `${
          formatEthAmount(
            (wallet as EthWalletType).data.get(walletApp.navState.protocol)!
              .balance
          ).eth
        }` + ethTicker
      : `${formatEthAmount((wallet as BitcoinWalletType).balance).eth} BTC`;

  return useMemo(
    () => (
      <WalletCardStyle
        layout="size"
        elevation="none"
        layoutId={`wallet-card-${wallet.address}`}
        justifyContent="flex-start"
        transition={walletCardStyleTransition}
        customBg={lighten(0.04, theme.currentTheme.windowColor)}
        borderColor={
          theme.currentTheme.mode === 'dark'
            ? darken(0.1, theme.currentTheme.backgroundColor)
            : darken(0.1, theme.currentTheme.windowColor)
        }
        mode={mode}
        isSelected={!!isSelected}
        onClick={onSelect}
      >
        <Text
          layoutId={`wallet-name-${wallet.address}`}
          layout="position"
          transition={{ duration: 0.1 }}
          fontWeight={600}
          color={rgba(theme.currentTheme.textColor, 0.4)}
          style={{ textTransform: 'uppercase' }}
        >
          {wallet.nickname}
        </Text>
        <Text
          mt={1}
          layoutId={`wallet-balance-${wallet.address}`}
          transition={{ duration: 0.1 }}
          fontWeight={600}
          fontSize={7}
        >
          {amountDisplay}
        </Text>
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
                    src={coin.logo || getMockCoinIcon(coin.name)}
                    style={{ height: '14px', marginRight: '4px' }}
                    key={index}
                  />
                ))}
            {coins && coins.length > 6 && (
              <Text ml={1} variant="body" color={theme.currentTheme.iconColor}>
                +{coins.length - 6}
              </Text>
            )}
          </Flex>
          <Text variant="body" color={theme.currentTheme.iconColor}>
            {transactions.length} Transactions
          </Text>
        </Flex>
      </WalletCardStyle>
    ),
    [wallet, isSelected, theme, mode, coins, transactions.length]
  );
};

WalletCard.defaultProps = {
  isSelected: false,
};
