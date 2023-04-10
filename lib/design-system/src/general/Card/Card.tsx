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
  background: ${(props) => props.customBg || 'rgba(var(--rlm-card-rgba))'};
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.customBg || 'rgba(var(--rlm-border-rgba))'};
  transition: var(--transition);
  box-sizing: border-box;
  border-radius: 12px;
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
