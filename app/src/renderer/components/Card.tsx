import styled from 'styled-components';
import {
  border,
  BorderProps,
  ShadowProps,
  shadow,
  compose,
} from 'styled-system';

import { Box, BoxProps } from './Box';

export type CardProps = BoxProps & BorderProps & ShadowProps;

export const Card = styled(styled(Box)`
  background: #ffffff;
  border: 1px solid rgba(219, 219, 219, 0.8);
  box-sizing: border-box;
  box-shadow: 0px 0px 14px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
`)<CardProps>(compose(border, shadow));
