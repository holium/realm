import {
  border,
  BorderProps,
  color,
  ColorProps,
  compose,
  flexbox,
  FlexboxProps,
  layout,
  LayoutProps,
  position,
  PositionProps,
  space,
  SpaceProps,
  textShadow,
  TextShadowProps,
  textStyle,
  TextStyleProps,
  typography,
  TypographyProps,
} from 'styled-system';

export type TypographyFunctionsProps = SpaceProps &
  ColorProps &
  LayoutProps &
  FlexboxProps &
  BorderProps &
  PositionProps &
  TypographyProps &
  TextShadowProps &
  TextStyleProps;

export const typographyFunctions = compose(
  space,
  color,
  layout,
  flexbox,
  border,
  position,
  typography,
  textShadow,
  textStyle
);
