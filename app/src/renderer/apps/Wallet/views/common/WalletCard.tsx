import { FC, useMemo } from 'react';
import { darken, lighten, rgba } from 'polished';
import styled, { css } from 'styled-components';
import { Text, Flex, Card } from 'renderer/components';
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
} from 'os/services/tray/wallet-lib/wallet.model';

interface CardStyleProps {
  isSelected: boolean;
  mode: string;
}

const CardStyle = styled(Card)<CardStyleProps>`
  ${(props: CardStyleProps) =>
    props.isSelected
      ? css``
      : css`
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 16px 12px;
          transition: box-shadow 0.25s ease;
          &:hover {
            transition: box-shadow 0.25s ease;
            box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.06);
          }
        `}
`;

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
      <CardStyle
        layout="size"
        elevation="none"
        layoutId={`wallet-card-${wallet.address}`}
        transition={{ duration: 0.1 }}
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
          layout="position"
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
                .map((coin, index) => (
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
      </CardStyle>
    ),
    [wallet, isSelected, theme, mode, coins, transactions.length]
  );
};

WalletCard.defaultProps = {
  isSelected: false,
};
