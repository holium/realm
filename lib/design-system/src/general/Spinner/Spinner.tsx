import {
  FlexboxProps,
  LayoutProps,
  PositionProps,
  SpaceProps,
} from 'styled-system';

import { Box } from '../Box/Box';
import { StyledSpinner } from './Spinner.styles';

const pxStringToNumber = (px: string) => Number(px.replace('px', ''));

const sizes = [12, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88];

type SpinnerProps = {
  size: number | string;
  width?: number;
  color?: string;
} & SpaceProps &
  LayoutProps &
  FlexboxProps &
  PositionProps;

export const Spinner = ({ size, color, width, ...boxProps }: SpinnerProps) => (
  <Box {...boxProps} display="flex" alignItems="center">
    <StyledSpinner
      size={typeof size === 'number' ? sizes[size] : pxStringToNumber(size)}
      width={width}
      color={color}
    />
  </Box>
);
