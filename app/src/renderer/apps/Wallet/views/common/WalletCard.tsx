import { FC, forwardRef, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Flex, Text } from 'renderer/components';

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
  ref: any;
}

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

export const WalletCard: FC<WalletCardProps> = forwardRef(
  ({ wallet, isSelected, onSelect }: WalletCardProps, ref: any) => {
    return (
      <CardStyle
        layoutId={`wallet-container-${wallet.address}`}
        ref={ref}
        layout
        isSelected={!!isSelected}
        onClick={onSelect}
      >
        <Text
          layoutId={`wallet-name-${wallet.address}`}
          opacity={0.5}
          fontWeight={600}
          style={{ textTransform: 'uppercase' }}
        >
          {wallet.name}
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

{
  /* <motion.div
  className={selectedId === card ? 'opened-card' : 'card'}
  key={i}
  layout
  drag={selectedId === card ? 'x' : false}
  dragConstraints={{ left: canDrag ? -850 : 0, right: 0 }}
  dragElastic={0.2}
  onPanEnd={(e, info) => handlePanEnd(e, info, card)}
  ref={(el) => (containerRefs.current[card] = el)}
>
  {selectedId === card && (
    <>
      <div />
      <div />
      <div />
    </>
  )}
</motion.div>; */
}
