import { FC, forwardRef } from 'react';
import { transparentize } from 'polished'
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Text } from 'renderer/components';
import { ThemeType } from 'renderer/theme';
import { useServices } from 'renderer/logic/store';
import { theme as themes } from 'renderer/theme';

type CardStyleProps = {
  isSelected: boolean;
};

const CardStyle = styled(motion.div)<CardStyleProps>`
  ${(props: CardStyleProps) =>
    props.isSelected
      ? css``
      : css`
          border: 1px solid #00000010;
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
  theme?: ThemeType
}

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

export const WalletCard: FC<WalletCardProps> = forwardRef(
  ({ wallet, isSelected, onSelect }: WalletCardProps) => {
    const { desktop } = useServices();

    const mode = desktop.theme.mode === 'light' ? 'light' : 'dark';
    const theme = themes[mode];

    return (
      <CardStyle
        layoutId={`wallet-container-${wallet.address}`}
        layout
        isSelected={!!isSelected}
        onClick={onSelect}
      >
        <Text
          layoutId={`wallet-name-${wallet.address}`}
          opacity={0.5}
          fontWeight={600}
          color={transparentize(.4, theme.colors.text.primary)}
          style={{ textTransform: 'uppercase' }}
        >
          {wallet.nickname}
        </Text>
        <Text
          layoutId={`wallet-balance-${wallet.address}`}
          opacity={0.9}
          fontWeight={600}
          fontSize={7}
        >
          {/* @ts-ignore */}
          {wallet.balance} {abbrMap[wallet.network]}
        </Text>
      </CardStyle>
    );
  }
);

WalletCard.defaultProps = {
  isSelected: false,
};
