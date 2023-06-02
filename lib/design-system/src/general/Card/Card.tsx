import styled, { css } from 'styled-components';

import { Box, BoxProps } from '../../general/Box/Box';

export type CardProps = {
  fill?: boolean;
  blur?: boolean;
  customBg?: string;
  elevation?: 0 | 1 | 2 | 3 | 4;
} & BoxProps;

const boxShadows = [
  '0px 0px 0px rgba(0, 0, 0, 0)',
  'var(--rlm-box-shadow-1)',
  'var(--rlm-box-shadow-2)',
  'var(--rlm-box-shadow-3)',
  'var(--rlm-box-shadow-4)',
];

export const Card = styled(Box)<CardProps>`
  flex-direction: column;
  backdrop-filter: ${({ blur = true }) => (blur ? 'var(--blur)' : 'none')};
  background: ${({ customBg = 'rgba(var(--rlm-card-rgba))' }) => customBg};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ borderColor = 'rgba(var(--rlm-border-rgba))' }) =>
    borderColor};
  transition: var(--transition);
  box-sizing: border-box;
  border-radius: 12px;
  ${({ fill, elevation = 0 }) => css`
    display: ${fill ? 'flex' : 'inline-flex'};
    box-shadow: ${boxShadows[elevation]};
  `}
`;
