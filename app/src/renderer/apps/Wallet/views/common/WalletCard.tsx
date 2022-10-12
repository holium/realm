import { FC } from 'react';
import { transparentize } from 'polished';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Text, Flex } from 'renderer/components';
import { ThemeType } from 'renderer/theme';
import { useServices } from 'renderer/logic/store';
import { theme as themes } from 'renderer/theme';
import { useTrayApps } from 'renderer/apps/store';
import { formatEthAmount } from '../../lib/helpers';

const coins = [
  {
    ticker: 'USDC',
    amount: '5765.2',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    ticker: 'BNB',
    amount: '1.1000',
    icon: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Binance-Coin-BNB-icon.png'
  },
  {
    ticker: 'SHIB',
    amount: '21300000',
    icon: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png'
  },
  {
    ticker: 'UNI',
    amount: '211',
    icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
  }
]

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
  wallet: any;
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
  let amountDisplay = `${formatEthAmount(wallet.balance).eth} ETH`;

  const mode = theme.currentTheme.mode === 'light' ? 'light' : 'dark';
  const themeData = themes[mode];

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
            {coins.map((coin, index) => <img src={coin.icon} style={{ height: '14px', marginRight: '4px' }} key={index} />)}
          </Flex>
          <Text variant="body" color={theme.currentTheme.iconColor}>112 Transactions</Text>
        </Flex>
      </CardStyle>
    </Flex>
  );
};

WalletCard.defaultProps = {
  isSelected: false,
};
