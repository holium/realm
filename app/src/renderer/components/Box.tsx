import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  background,
  BackgroundProps,
  border,
  BorderProps,
  ButtonStyleProps,
  color,
  ColorProps,
  colorStyle,
  ColorStyleProps,
  compose,
  flexbox,
  FlexboxProps,
  grid,
  GridProps,
  layout,
  LayoutProps,
  opacity,
  OpacityProps,
  position,
  PositionProps,
  space,
  SpaceProps,
  style,
  textStyle,
  TextStyleProps,
  typography,
  TypographyProps,
  variant,
} from 'styled-system';

type TextDecorationOption = 'overline' | 'line-through' | 'underline';
type TextTransformOption = 'uppercase' | 'lowercase' | 'capitalize';

export type BoxProps = {
  gap?: string | number | undefined;
} & BackgroundProps &
  ButtonStyleProps &
  ColorProps &
  ColorStyleProps &
  FlexboxProps &
  GridProps &
  BorderProps &
  LayoutProps &
  OpacityProps &
  PositionProps &
  SpaceProps &
  TextStyleProps &
  TypographyProps & {
    textDecoration?:
      | TextDecorationOption
      | Array<TextDecorationOption | null | string>;
    textTransform?:
      | TextTransformOption
      | Array<TextTransformOption | null | string>;
  } & HTMLAttributes<any>;

const textDecoration = style({
  prop: 'textDecoration',
  cssProperty: 'textDecoration',
});

const textTransform = style({
  prop: 'textTransform',
  cssProperty: 'textTransform',
});

const boxStyles = compose(
  background,
  color,
  colorStyle,
  flexbox,
  grid,
  layout,
  opacity,
  position,
  space,
  textStyle,
  textDecoration,
  textTransform,
  typography,
  border,
  variant({
    prop: 'variant',
    scale: 'buttons',
    variants: {
      primary: {},
    },
  })
);

export const Box = styled(motion.div)<BoxProps>(
  {
    boxSizing: 'border-box',
  },
  boxStyles
);

export default { Box };
