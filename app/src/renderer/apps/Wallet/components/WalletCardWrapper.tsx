import styled, { css } from 'styled-components';
import { Card } from 'renderer/components';

interface CardStyleProps {
  isSelected: boolean;
  mode: string;
}

export const WalletCardStyle = styled(Card)<CardStyleProps>`
  ${(props: CardStyleProps) =>
    props.isSelected
      ? css`
          border-radius: 16px !important;
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 16px 12px 0px 16px;
          transition: box-shadow 0.1s ease;
          box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
        `
      : css`
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 16px 12px;
          transition: box-shadow 0.1s ease;
          border-radius: 16px !important;
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
