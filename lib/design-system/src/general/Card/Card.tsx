import styled, { css } from 'styled-components';
import { Box, BoxProps } from '../../general/Box/Box';

export type CardProps = {
  fill?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
} & BoxProps;

const elevation = [
  '0px 0px 0px rgba(0, 0, 0, 0)',
  '0px 1px 2px rgba(0, 0, 0, 0.05)',
  '0px 2px 4px rgba(0, 0, 0, 0.05)',
  '0px 4px 8px rgba(0, 0, 0, 0.05)',
  '0px 8px 16px rgba(0, 0, 0, 0.05)',
  '0px 16px 32px rgba(0, 0, 0, 0.05)',
];

export const Card = styled(Box)<CardProps>`
  margin-top: 1px;
  flex-direction: column;
  backdrop-filter: var(--blur);
  background-color: var(--rlm-card-color);
  border: 1px solid var(--rlm-border-color);
  ${(props: CardProps) => css`
    display: ${props.fill ? 'flex' : 'inline-flex'};
    box-shadow: ${elevation[props.elevation || 0]};
  `}
`;

Card.defaultProps = {
  elevation: 0,
  borderRadius: 9,
  borderColor: 'border',
};
