import styled from 'styled-components';
import { Box, BoxProps } from '../Box/Box';

export type FlexProps = {
  gap?: string | number;
  inline?: boolean;
} & BoxProps;

export const Flex = styled(Box)<FlexProps>`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  ${({ gap }) => gap && `gap: ${typeof gap === 'string' ? gap : `${gap}px`};`}
`;
