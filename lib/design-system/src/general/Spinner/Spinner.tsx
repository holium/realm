import {
  FlexboxProps,
  LayoutProps,
  PositionProps,
  SpaceProps,
} from 'styled-system';
import { Box } from '../Box/Box';
import { StyledSpinner } from './Spinner.styles';

const pxStringToNumber = (px: string) => Number(px.replace('px', ''));

const sizes = [16, 24, 32, 40, 48, 56, 64, 72, 80, 88];

type SpinnerProps = {
  size: number | string;
  color?: string;
} & SpaceProps &
  LayoutProps &
  FlexboxProps &
  PositionProps;

export const Spinner = ({ size, color, ...boxProps }: SpinnerProps) => (
  <Box {...boxProps} display="flex" alignItems="center">
    <StyledSpinner
      size={typeof size === 'number' ? sizes[size] : pxStringToNumber(size)}
      color={color}
    />
  </Box>
);
