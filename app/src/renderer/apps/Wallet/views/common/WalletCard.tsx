import { FC } from 'react';
import { transparentize } from 'polished';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Text, Flex } from 'renderer/components';
import { ThemeType } from 'renderer/theme';
import { useServices } from 'renderer/logic/store';
import { theme as themes } from 'renderer/theme';
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
} from 'os/services/tray/wallet.model';

type CardStyleProps = {
  isSelected: boolean;
  mode: string;
};

const CardStyle = styled(motion.div)<CardStyleProps>`
  ${(props: CardStyleProps) =>
    props.isSelected
      ? css``
      : css`
          border: 1px solid
            ${(props: CardStyleProps) =>
              props.mode === 'light' ? ' #00000010' : '#83909F'};
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 16px 12px;
        `}
`;
interface WalletCardProps {
  wallet: EthWalletType/* | BitcoinWalletType*/;
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
  const themeData = themes[mode];

  let coins = null;
  if ('coins' in wallet) {
    coins = getCoins(wallet.coins);
  }

  console.log(wallet.address);

  var transactions = getTransactions(
    wallet.transactions,
//    wallet!.address
  );

  let amountDisplay = `${formatEthAmount(wallet.balance).eth} ETH`;

  return (
    <Flex mt={6}>
      <CardStyle
        mode={mode}
        layoutId={`wallet-container-${wallet.address}`}
        layout
        isSelected={!!isSelected}
        onClick={onSelect}
      >
        <Text
          layoutId={`wallet-name-${wallet.address}`}
          opacity={0.5}
          fontWeight={600}
          color={transparentize(0.4, themeData.colors.text.primary)}
          style={{ textTransform: 'uppercase' }}
        >
          {wallet.nickname}
        </Text>
        <Text
          mt={1}
          layoutId={`wallet-balance-${wallet.address}`}
          opacity={0.9}
          fontWeight={600}
          fontSize={7}
        >
          {/* @ts-ignore */}
          {amountDisplay}
        </Text>
        <Flex pt={2} justifyContent="space-between" alignItems="center">
          <Flex>
            {coins &&
              coins.map((coin, index) => (
                <img
                  src={coin.logo || getMockCoinIcon(coin.name)}
                  style={{ height: '14px', marginRight: '4px' }}
                  key={index}
                />
              ))}
          </Flex>
          <Text variant="body" color={theme.currentTheme.iconColor}>
            {transactions.length} Transactions
          </Text>
        </Flex>
      </CardStyle>
    </Flex>
  );
};

WalletCard.defaultProps = {
  isSelected: false,
};
