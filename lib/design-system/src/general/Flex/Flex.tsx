import styled from 'styled-components';
import { Box, BoxProps } from '../Box/Box';

export type FlexProps = {
  gap?: string | number;
  inline?: boolean;
  col?: boolean;
  row?: boolean;
  grow?: boolean;
  justify?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  align?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
} & BoxProps;

export const Flex = styled(Box)<FlexProps>`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  ${({ gap }) => gap && `gap: ${typeof gap === 'string' ? gap : `${gap}px`};`}
  ${({ col }) => col && `flex-direction: column;`}
  ${({ row }) => row && `flex-direction: row;`}
  ${({ grow }) => grow && `flex-grow: 1;`}
  ${({ justify }) => justify && `justify-content: ${justify};`}
  ${({ align }) => align && `align-items: ${align};`}
`;
