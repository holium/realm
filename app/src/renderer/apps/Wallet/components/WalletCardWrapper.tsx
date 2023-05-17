import styled, { css } from 'styled-components';

import { Card } from '@holium/design-system/general';

interface CardStyleProps {
  isSelected: boolean;
}

export const WalletCardStyle = styled(Card)<CardStyleProps>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 12px 16px;
  transition: box-shadow 0.1s ease;
  border-radius: 16px !important;

  ${(props: CardStyleProps) =>
    props.isSelected
      ? css`
          gap: 10px;
          box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
        `
      : css`
          &:hover {
            transition: box-shadow 0.25s ease;
            box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
          }
        `}
`;

export const walletCardStyleTransition = {
  duration: 0.1,
  layout: { duration: 0.1, ease: 'easeInOut' },
};
