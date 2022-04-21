import {
  compose,
  space,
  layout,
  flexbox,
  border,
  position,
  color,
  typography,
  textShadow,
  SpaceProps,
  ColorProps,
  LayoutProps,
  FlexboxProps,
  BorderProps,
  PositionProps,
  TypographyProps,
  TextShadowProps,
} from 'styled-system';

export type TypographyFunctionsProps = SpaceProps &
  ColorProps &
  LayoutProps &
  FlexboxProps &
  BorderProps &
  PositionProps &
  TypographyProps &
  TextShadowProps;

export const typographyFunctions = compose(
  space,
  color,
  layout,
  flexbox,
  border,
  position,
  typography,
  textShadow
);
