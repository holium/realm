import styled, { css } from 'styled-components';
import { Box, BoxProps } from '../../general/Box/Box';

export type CardProps = {
  fill?: boolean;
  customBg?: string;
  elevation?: 0 | 1 | 2 | 3 | 4;
} & BoxProps;

const elevation = [
  '0px 0px 0px rgba(0, 0, 0, 0)',
  'var(--rlm-box-shadow-1)',
  'var(--rlm-box-shadow-2)',
  'var(--rlm-box-shadow-3)',
  'var(--rlm-box-shadow-4)',
];

export const Card = styled(Box)<CardProps>`
  margin-top: 1px;
  flex-direction: column;
  backdrop-filter: var(--blur);
  background-color: ${(props) => props.customBg || 'var(--rlm-card-color)'};
  border: 1px solid var(--rlm-border-color);
  ${(props: CardProps) => css`
    display: ${props.fill ? 'flex' : 'inline-flex'};
    box-shadow: ${elevation[props.elevation || 0]};
  `}
`;

Card.defaultProps = {
  elevation: 0,
  borderRadius: 12,
  borderColor: 'border',
};
