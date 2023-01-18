import styled from 'styled-components';
import { Box, BoxProps } from '../Box/Box';

export type FlexProps = {
  gap?: string | number;
} & BoxProps;

export const Flex = styled(Box)`
  display: flex;
  ${({ gap }) => gap && `gap: ${typeof gap === 'string' ? gap : `${gap}px`};`}
`;
